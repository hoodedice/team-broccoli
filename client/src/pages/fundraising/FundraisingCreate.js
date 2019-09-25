import React, { Component } from "react";

import { theme } from '../../themes/theme'
import { FormControl, FormLabel, Typography, TextField, Container, Grid, Input, InputAdornment, Icon, Paper } from "@material-ui/core";
//import { Event } from "@material-ui/icons"
import { withStyles } from "@material-ui/core/styles";
import Snackbar from "@material-ui/core/Snackbar";
//import { DatePicker } from "@materual-ui/pickers"
import ImageUpload from '../../components/ImageUpload';
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DayjsUtils from '@date-io/dayjs';

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  dense: {
    marginTop: theme.spacing(2),
  },
  menu: {
    width: 200,
  },
  theme: theme
});


class FundraisingCreate extends Component {
  constructor() {
    super();
    this.state = {
      fundraiser: {
        title: "",
        description: "",
        amount: "",
        deadline: "",
      },
      snackbarOpen: false,
      snackbarMsg: ""
    }

  }

  snackbarClose = () => {
    this.setState({
      snackbarOpen: false
    });
  };


  updateText = event => {
    let updatedText = Object.assign({}, this.state.fundraiser);
    updatedText[event.target.name] = event.target.value;

  };

  validate = (data) => {
    if (!data.title) {
      this.setState({
        snackbarOpen: true,
        snackbarMsg: "Fundraiser title is required and must be at least 3 characters"
      });
    }
    if (!data.description) {
      this.setState({
        snackbarOpen: true,
        snackbarMsg: "Fundraiser description is required and must be at least 200 characters"
      });
    }
    if (!data.amount) {
      this.setState({
        snackbarOpen: true,
        snackbarMsg: "Fundraiser amount is required and must be at least $5"
      });
    }
    if (!data.deadline) {
      this.setState({
        snackbarOpen: true,
        snackbarMsg: "Fundraiser deadline is required"
      });
    }
  }

  handleSubmit = event => {
    event.preventDefault();
    // todo add length checks
    this.validate(this.state.fundraiser);
    // deadline must be later than today

  };


  render() {

    console.log(theme);
    return (
      <div className="pageView">
        <form noValidate autoComplete="off">
          <Container maxWidth="md">
            <Grid
              container
              direction="column"
              justify="space-around"
              alignItems="stretch"
              spacing={2}
            >
              <h1>Create New Fundraiser</h1>

              <Grid item>
                <FormControl fullWidth required>
                  <FormLabel fullWidth>
                    What is your cause you'd like to fundraise for?
                  </FormLabel>
                  <TextField
                    // label="Write a cause title"
                    placeholder="Write a cause title"
                    margin="normal"
                    name="title"
                    variant="outlined"
                    onChange={this.updateText}
                    fullWidth
                  />
                </FormControl>
              </Grid>

              <Grid item>
                <FormControl fullWidth required>
                  <FormLabel>
                    Description
                  </FormLabel>
                  <TextField
                    placeholder="Write a cause title"
                    name="title"
                    margin="normal"
                    multiline
                    rows="7"
                    variant="outlined"
                    onChange={this.updateText}
                    defaultComponent="textarea"
                  />
                </FormControl>
              </Grid>

              <Grid container item spacing={1}>
                <Grid item xs={3}>
                  <FormControl fullWidth required>
                    <FormLabel>
                      Amount
                    </FormLabel>
                    <TextField
                      InputProps={{ 
                        startAdornment: <InputAdornment>$</InputAdornment>
                      }}
                      placeholder="100.00"
                      name="amount"
                      margin="normal"
                      variant="outlined"
                      onChange={this.updateText}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs></Grid>

                <Grid item xs={8} >
                  <FormControl fullWidth required>
                    <FormLabel>
                      Deadline
                    </FormLabel>
                  <Grid container direction="row" item spacing={1}>
                    <Grid item xs={4}>
                      <MuiPickersUtilsProvider utils={ DayjsUtils }>
                        <DatePicker
                        InputProps={{ 
                          endAdornment: <InputAdornment>
                            <Icon>event</Icon>
                          </InputAdornment>
                        }}
                        placeholder="Date"
                        name="date"
                        margin="normal"
                        inputVariant="outlined"
                        onChange={this.updateText}
                        variant="inline"
                      />
                      </MuiPickersUtilsProvider>
                      
                      {/* <TextField
                        InputProps={{ 
                          endAdornment: <InputAdornment>
                            <Icon>event</Icon>
                          </InputAdornment>
                        }}
                        placeholder="Date"
                        name="date"
                        margin="normal"
                        variant="outlined"
                        onChange={this.updateText}
                      /> */}
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        InputProps={{ 
                          endAdornment: <InputAdornment><Icon>schedule</Icon></InputAdornment>
                        }}
                        placeholder="Time"
                        name="time"
                        margin="normal"
                        variant="outlined"
                        onChange={this.updateText}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        InputProps={{ 
                          startAdornment: <InputAdornment position="finish">$</InputAdornment>
                        }}
                        placeholder="Time"
                        name="time"
                        margin="normal"
                        variant="outlined"
                        onChange={this.updateText}
                      />
                    </Grid>

                  </Grid>
                </FormControl>

              </Grid>
            </Grid>

            <Grid item>
              <Paper>
                <ImageUpload />
              </Paper>
            </Grid>

            </Grid>
          </Container>
        </form>
      </div>
    );
  }

}

export default withStyles(styles)(FundraisingCreate);