const jwt = require('jsonwebtoken');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const requiredParam = argumentName => { throw new Error(`Param ${argumentName} not set.`) }

function getQuery(params) {
    return Object.keys(params)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
}

function getToken({ issuerId, apiKeyId, apiKey }) {
    const expirationTime = Math.round((new Date()).getTime() / 1000) + 1199; // max validity 20 min

    const payload = {
        iss: issuerId,
        exp: expirationTime,
        aud: "appstoreconnect-v1"
    };

    const signOptions = {
        algorithm: "ES256",
        header: {
            alg: "ES256",
            kid: apiKeyId,
            typ: "JWT"
        }
    };

    const privateKey = apiKey;
    const token = jwt.sign(payload, privateKey, signOptions);

    return token;
}

module.exports = async function main(params) {
    const issuerId = params.issuerId || requiredParam('issuerId');
    const apiKey = params.apiKey || requiredParam('apiKey');
    const apiKeyId = params.apiKeyId || requiredParam('apiKeyId');
    const appId = params.appId || requiredParam('appId');
    const version = params.version || requiredParam('version');

    if (/^\d+$/.test(appId) === false) {
        throw new Error('appId must consist of numbers only e.g. 1234567890, received: ' + appId)
    } 

    const token = getToken({ issuerId, apiKey, apiKeyId});
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }

    // check if app exists
    const queryAppStatus = getQuery({ "fields[apps]": "bundleId" });
    const statusCode = await fetch(`https://api.appstoreconnect.apple.com/v1/apps/${appId}?${queryAppStatus}`, {
        method: 'get',
        headers,
    }).then(res => res.status);

    if (statusCode >= 400) {
        throw new Error(`Could not find app ${appId} on App Store Connect`);
    }

    const query = getQuery({
        "filter[app]": appId,
        "fields[builds]": "version",
        "sort": "-version",
        "filter[preReleaseVersion.version]": version,
        "limit": "1"
    });

    const result = await fetch(`https://api.appstoreconnect.apple.com/v1/builds?${query}`, {
        method: 'get',
        headers,
    }).then(res => res.json());

    const lastVersionString = result.data[0] && result.data[0].attributes.version;
    const lastVersionNumber = parseInt(lastVersionString)
    const lastVersion = isNaN(lastVersionNumber) ? -1 : lastVersionNumber;
    return lastVersion
}