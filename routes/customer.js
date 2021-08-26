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


const router = express.Router();


/**
 * Matches: GET /subscription/view/:locationId/:customerId/:subscriptionPlanId
 *
 * Description:
 *  Renders the subscription plan information that includes:
 *    * subscription plan phase information
 *    * active subscription status
 *    * button to subscribe, unsubscribe or revert cancelling subscription depends on the status of subscription
 *
 * Query Parameters:
 *  locationId: Id of the location that the invoice belongs to
 *  customerId: Id of the selected customer
 *  subscriptionPlanId: Id of the subscription plan
 */



/**
 * Matches: POST /subscription/subscribe
 *
 * Description:
 *  subscribe to the plan by create a subscription with the plan id
 *
 * Request Body:
 *  planId: Id of the subscription plan
 *  customerId: Id of the selected customer
 *  locationId: Id of the location that the order belongs to
 *  idempotencyKey: Unique identifier for request from client
 */
router.post('/', function(req, res) {
    console.log("pleeeassssseeeeeeee help")
      var payload = JSON.stringify(req.body);
      var signature = req.get("intuit-signature")

      // if signature is empty return 401
      if (!signature) {
          return res.status(401).send('FORBIDDEN');
      }

      // if payload is empty, don't do anything
      if (!payload) {
          return res.status(200).send('success');
      }
      
      // validate signature
      if (util.isValidPayload(signature, payload)) {

          // add to queue
          console.log('task added to queue ');
      
          return res.status(200).send('success');
      } else {
          return res.status(401).send('FORBIDDEN');
      }

  });







module.exports = router;
