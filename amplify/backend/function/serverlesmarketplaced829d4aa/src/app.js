/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

require("dotenv").config({
    path: ".env",
});

var express = require("express");
var bodyParser = require("body-parser");
var awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");

// declare a new express app
var app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "*");
//     next();
// });
const cors = require("cors");
app.use(cors());

const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/****************************
 * Example post method *
 ****************************/

app.post("/charge", async (req, res) => {
    // Add your code here
    const { token, charge } = req.body;
    try {
        const result = await stripe.charges.create({
            source: token,
            amount: charge.amount,
            currency: charge.currency,
            description: charge.description,
        });

        res.status(201).json({ result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/****************************
 * Example put method *
 ****************************/

app.listen(3000, function () {
    console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
