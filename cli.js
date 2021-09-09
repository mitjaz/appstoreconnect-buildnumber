#!/usr/bin/env node

const appstoreconnectBuildNumber = require('./index');
const requiredEnv = ENVName => { throw new Error(`ENV ${ENVName} not set.`) }
const requiredArgument = argumentName => { throw new Error(`Argument ${argumentName} not set.`) }

var args = process.argv.slice(2);
const apiKey = process.env.API_KEY || requiredEnv('API_KEY');
const apiKeyId = process.env.API_KEY_ID || requiredEnv('API_KEY_ID');
const issuerId = process.env.ISSUER_ID || requiredEnv('ISSUER_ID');
const appId = args[0] || requiredArgument('appId');
const version = args[1] || requiredArgument('version');

try {
    appstoreconnectBuildNumber({ apiKey, apiKeyId, issuerId, appId, version }).then(console.log)
} catch (error) {
    console.error(error.message)
}