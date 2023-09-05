const express = require('express');
const app = express();
require('dotenv').config();
var coinbase = require('coinbase-commerce-node');
var Client = coinbase.Client;
var resources = coinbase.resources;
var Webhook = coinbase.Webhook;

app.use(express.json({
    verify: (req, res, buf) => {
        const url = req.originalUrl;

        if (url.startsWith("/webhook")) {
            req.rawBody = buf.toString();
        }
    }
}));

Client.init(process.env.COINBASE_API_KEY);

app.post("/checkout", async (req, res) => {
    const { amount, currency } = req.body;

    try {
        const charge = await resources.Charge.create({
            'name': 'Invorion Private Limited',
            'description': 'Platform Charge',
            'pricing_type': 'fixed_price',
            'local_price': {
                'amount': amount,
                'currency': currency
            },
            'requested_info': ['name', 'email'],
            'metadata': {
                user_id: "pmj@1996"
            }
        });

        res.status(200).json({
            charge: charge
        })
    } catch (error) {
        res.status(500).json({
            error: error
        });
    }

})

app.post("/webhooks", async (req, res) => {

    try {

        const event = Webhook.verifyEventBody(
            req.rawBody,
            req.headers("x-cc-webhook-signature"),
            process.env.COINBASE_WEBHOOK_SECRET
        );
        if (event.type === "charge:confirmed") {
            let amount = event.data.pricing.local.amount;
            let currency = event.data.pricing.local.currency;
            let user_id = event.data.metadata.user_id;
            console.log(amount, currency, user_id);

        }
        res.status(200);

    } catch (error) {
        res.status(500).json({
            error: error
        })
    }

})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});