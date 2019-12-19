'use strict';

require('dotenv').config();

const express = require('express');
const router = express.Router();
const request = require('request');
const fs = require('fs');

router.get('/accounts/:siteId', (req, res) => {
    const {siteId} = req.params;
    const accountData = getAccountInfo(siteId);

    delete accountData.privatekey;

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(accountData));
});

router.post('/user/profile', (req, res) => {

    const {accountId, encryptedtoken} = req.body;

    const accountData = getAccountInfo(accountId);

    const {publickey, privatekey, userInfoURL} = accountData

    const options = {
        method: 'POST',
        url: 'https://auth-token-ws.herokuapp.com/decrypttoken',
        json: true,
        body: {
            encryptedtoken,
            publickey,
            privatekey
        }
    }

    request(options, (err, response, responseBody) => {
        if (err) { return console.log(err); }

        const { token } = responseBody;

        const profileOption = {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            url: `${userInfoURL}`
        }

        request(profileOption, (err, profileResponse, profileResponseBody) => {
            res.send(profileResponseBody);
        });
    });
});

const getAccountInfo = (accountId) => {
    const authData = fs.readFileSync('auth-account-data.json');
    const authDataList = JSON.parse(authData);

    const accountData = authDataList.find(item => item.siteId == accountId);

    return accountData;
}

module.exports = router;