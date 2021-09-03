/*
Copyright 2020 Square Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
// var util = require('../util/util');
// var queue = require('../queue/queue');
// var config = require('../conf');
const express = require("express");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const crypto = require('crypto');

const routes = require("./routes/index");
const app = express();

// Node creates cashed instance of square-client, on initial load
require("./util/square-client");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, ".well-known")));

app.use("/", routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handlers
// For simplicity, we print all error information
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    status: err.status,
    message: err.message,
    // If it is a response error then format the JSON string, if not output the error
    error: err.errors ? JSON.stringify(err.errors, null, 4) : err.stack
  });
});

// The crypto module provides cryptographic functionality
// The notification URL  bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbnbnbnbbnbnnbbnnbnbnnbnbnbnnbnb





const md5 = require('md5');
const { ApiError, Client, Environment } = require('square');
app.use(cookieParser());
app.set('view engine', 'ejs');

// const { PORT, SQ_ENVIRONMENT, SQ_APPLICATION_ID, SQ_APPLICATION_SECRET } = process.env;
let basePath;
let environment;
if (SQ_ENVIRONMENT.toLowerCase() === "production") {
  basePath = `https://connect.squareup.com`;
  environment = Environment.Production;
} else if (SQ_ENVIRONMENT.toLowerCase() === "sandbox") {
  basePath = `https://connect.squareupsandbox.com`;
  environment = Environment.Sandbox;
} else {
  console.warn('Unsupported value for SQ_ENVIRONMENT in .env file.');
  process.exit(1);
}

// Check if example secrets were set
if (!SQ_APPLICATION_ID || !SQ_APPLICATION_SECRET) {
  console.warn('\x1b[33m%s\x1b[0m', 'Missing secrets! Configure set values for SQ_APPLICATION_ID and SQ_APPLICATION_SECRET in a .env file.');
  process.exit(1);
}



const messages = require('./messages');
// Configure Square defcault client
const squareClient = new Client({
  environment: environment
});

// Configure Square OAuth API instance
const oauthInstance = squareClient.oAuthApi;

// INCLUDE PERMISSIONS YOU WANT YOUR SELLER TO GRANT YOUR APPLICATION
const scopes = [
  "ITEMS_READ",
  "MERCHANT_PROFILE_READ",
  "PAYMENTS_WRITE_ADDITIONAL_RECIPIENTS",
  "PAYMENTS_WRITE"

];

app.get("/request_token", (req, res) => {
  // Set the Auth_State cookie with a random md5 string to protect against cross-site request forgery.
  // Auth_State will expire in 300 seconds (5 mins) after the page is loaded.
  var state = md5(Date.now())
  var url = basePath + `/oauth2/authorize?client_id=${SQ_APPLICATION_ID}&` + `response_type=code&` + `scope=${scopes.join('+')}` + `&state=` + state
  content = `
    <link type="text/css" rel="stylesheet" href="style.css">
    <meta name="viewport" content="width=device-width">
    <div class="wrapper">
      <a class="btn"
       href="${url}">
         <strong>Authorize</strong>
      </a>
    </div>`
  res.cookie("Auth_State", state, { expire: Date.now() + 300000 }).render('base', {
    content: content
  })
});

/**
 * Description:
 *  Serves requests from Square to your application's redirect URL
 *  Note that you need to set your application's Redirect URL to
 *  http://localhost:8000/callback from your application dashboard
 *
 * Query Parameters:
 *  state: the Auth State set in request_token
 *  response_type: the type of the response; should be "code"
 *  code: the authorization code
 */
app.get('/callback', async (req, res) => {
  console.log(req.query);
  // Verify the state to protect against cross-site request forgery.
  if (req.cookies["Auth_State"] !== req.query['state']) {
    content = messages.displayStateError();
    res.render('base', {
      content: content
    });
  }

  else if (req.query['error']) {
    // Check to see if the seller clicked the Deny button and handle it as a special case.
    if (("access_denied" === req.query['error']) && ("user_denied" === req.query["error_description"])) {
      res.render(messages.displayError("Authorization denied", "You chose to deny access to the app."));
    }
    // Display the error and description for all other errors.
    else {
      content = messages.displayError(req.query["error"], req.query["error_description"])
      res.render('base', {
        content: content
      });
    }
  }
  // When the response_type is "code", the seller clicked Allow
  // and the authorization page returned the auth tokens.
  else if ("code" === req.query["response_type"]) {
    // Extract the returned authorization code from the URL
    var { code } = req.query;

    try {
      let { result } = await oauthInstance.obtainToken({
        // Provide the code in a request to the Obtain Token endpoint
        code,
        clientId: SQ_APPLICATION_ID,
        clientSecret: SQ_APPLICATION_SECRET,
        grantType: 'authorization_code'
      });

      let {
        // Extract the returned access token from the ObtainTokenResponse object
        accessToken,
        refreshToken,
        expiresAt,
        merchantId
      } = result;

      // Because we want to keep things simple and we're using Sandbox,
      // we call a function that writes the tokens to the page so we can easily copy and use them directly.
      // In production, you should never write tokens to the page. You should encrypt the tokens and handle them securely.
      content = messages.writeTokensOnSuccess(accessToken, refreshToken, expiresAt, merchantId)
      res.render('base', {
        content: content
      });
    } catch (error) {
      // The response from the Obtain Token endpoint did not include an access token. Something went wrong.
      if (error instanceof ApiError) {
        content = messages.displayError('Exception', JSON.stringify(error.result))
        res.render('base', {
          content: content
        });
      } else {
        content = messages.displayError('Exception', JSON.stringify(error))
        res.render('base', {
          content: content
        });
      }
    }
  }
  else {
    // No recognizable parameters were returned.
    content = messages.displayError("Unknown parameters", "Expected parameters were not returned")
    res.render('base', {
      content: content
    });
  }
});

















module.exports = app;
