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

const express = require("express");
const managementRoute = require("./management");
const subscriptionRoute = require("./subscription");

const {
  customersApi,
  locationsApi,
} = require("../util/square-client");

const router = express.Router();

/**
 * Matches: /management and /subscription respectively.
 *
 * Description:
 *  If the rquest url matches one of the router.use calls, then the routes used are in the
 *  required file.
 */
router.use("/management", managementRoute);
router.use("/subscription", subscriptionRoute);

/**
 * Matches: GET /
 *
 * Description:
 * Retrieves list of customers then render the homepage with a list of the customers that has an email.
 */
router.get("/", async (req, res, next) => {

  try {
    // Retrieve the main location which is the very first location merchant has
    const { result : { location } } = await locationsApi.retrieveLocation("main");
    // Retrieves customers for this current merchant
    let { result: { customers } } = await customersApi.listCustomers();
    // Subscriptions API should work with the customers that have an email.
    customers = customers ? customers.filter(customer => customer.emailAddress) : [];

    if (customers.length === 0) {
      // throw error to remind the possible issue
      throw new Error("No valid customer retreived, this example only works with customers that have email information.");
    }

    // Render the customer list homepage
    res.render("index", {
      locationId: location.id, // use the main location as the default
      customers,
    });
  } catch (error) {
    next(error);
  }
});
const crypto = require('crypto');
// The notification URL
const NOTIFICATION_URL = 'https://rocky-island-32652.herokuapp.com/';

// event notification subscription signature key (sigKey) defined in 
// dev portal for app
// Note: Signature key is truncated for illustration
const sigKey = 'XXii5DLKG-sFoxbR2qhnSw';

console.log("balabizo 1")
function isFromSquare(NOTIFICATION_URL, request, sigKey) {
  const hmac = crypto.createHmac('sha1', sigKey);
  hmac.update(NOTIFICATION_URL + JSON.stringify(request.body));
  const hash = hmac.digest('base64');
for(let i=0;i<10;i++){
  console.log("karim tofa7a")
}
return {
  'statusCode': 200,
  'body': "ok"
}
  // return request.get('X-Square-Signature') === hash;
}
console.log("balabizo 2")
module.exports = router;
