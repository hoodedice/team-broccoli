from datetime import datetime
import json
from flask import jsonify, request, Blueprint, current_app
from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
)
import app # full module import due to circular dependencies
from config import APP_URL, STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET
from models import Donation, Fundraiser, User

import stripe

donation_handler = Blueprint('donation_handler', __name__)

stripe.api_key = STRIPE_API_KEY

@donation_handler.route('/make_session', methods=['POST'])
@jwt_required
def make_stripe_session():
    if request.method == 'POST':
        try:
            body = json.loads(request.get_data())
        except json.JSONDecodeError:
            return jsonify({'error': 'Malformed request data.'}), 400

        # We need the line item to provide to Stripe, and the fundraiser ID
        # so that we know what to credit when we get a success.
        line_item = body.get('line_item')
        if not line_item:
            return jsonify({'error': 'Malformed request data.'}), 400

        # We need to do some cleaning on the line_item --
        # in particular, we need to have a 'quantity' of 1, and
        # we need to pass 'amount' as an integer number of cents
        # rather than a string.
        line_item['quantity'] = 1
        amount = 0
        try:
            amount = float(line_item['amount'])
            amount *= 100
            amount += 0.5
            line_item['amount'] = int(amount)
        except:
            return jsonify({'error': "Couldn't parse donation amount."}), 400

        fundraiser_id = body.get('fundraiser_id')
        if not fundraiser_id:
            return jsonify({'error': 'Malformed request data.'}), 400

        fundraiser = Fundraiser.find_by_id(fundraiser_id)
        if not fundraiser:
            # this is resources.Fundraiser.FUNDRAISER_NOT_FOUND
            # TODO -- centralize and clean up backend messages like this one
            return jsonify({'message': 'Fundraiser does not exist.'}), 404

        user_email = get_jwt_identity()
        user = User.find_by_email(user_email)
        if not user:
            # a new error message. TODO -- centralize and clean up.
            return jsonify({'message': 'Please log in before donating.'}), 401

        stripe_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[line_item],
            success_url=f'{APP_URL}/donate/success?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'{APP_URL}/donate/cancel?session_id={{CHECKOUT_SESSION_ID}}',
        )

        donation = Donation(
            amount = line_item.get('amount'),
            created_at = datetime.now(),
            fundraiser_id = fundraiser_id,
            user_id = user.id,
            stripe_session = stripe_session.id,
            payment_finalized = False,
        )
        app.db.session.add(donation)
        app.db.session.commit()

        return jsonify({'session_id': stripe_session.id}), 201


@donation_handler.route('/donations/confirm', methods=['POST'])
def confirm_donation():
    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature')
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return jsonify({'error': 'Invalid payload.'}), 400
    except stripe.error.SignatureVerificationError:
        current_app.logger.critical('Stripe signature error')
        return jsonify({'error': 'Invalid message signature.'}), 400

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        donation = Donation.query.filter_by(stripe_session=session['id']).first()
        if not donation:
            return jsonify({'error':'No donation record for this session.'}), 500

        donation.payment_finalized = True
        app.db.session.add(donation)
        app.db.session.commit()

    return jsonify({'message':'OK'}), 200 # Stripe only looks at the HTTP status