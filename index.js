const VoiceResponse = require('twilio').twiml.VoiceResponse;
const AWS = require('aws-sdk');
const dns = require('dns');
const dnsPromises = dns.promises;


var route53 = new AWS.Route53({apiVersion: '2013-04-01'});

function topMenu() {
    const twimlout = new VoiceResponse();
    
    const gather = twimlout.gather({
        action: './select',
        method: 'GET',
        numDigits: '1'
    });
    gather.say('Hello! Welcome to DNS via DTMF.  Press 1 to get the current IP.  Press 2 to set a new IP.');
    
    return twimlout.toString();
}

function selectOption(digit) {
    const Digit = parseInt(digit);
    switch (Digit) {
        case 1: return optionOne();
            break;
        case 2: return optionTwo();
            break;
        default:
            return backToRoot();
            break;
    }
    return;
}

async function optionOne() {
    const twimlout = new VoiceResponse();
    const ip = await getCurrentIP();
    twimlout.say({
        voice: 'woman',
        language: 'en-US'
    }, `You have selected option 1.  The current IP is ${ip}`);
    twimlout.pause({
        length: 3
    });
    twimlout.redirect({
        method: 'GET'
    }, './join');
    return twimlout.toString();
}

function optionTwo() {
    const twimlout = new VoiceResponse();

    const gather = twimlout.gather({
        action: './gather2',
        method: 'GET',
        finishOnKey: '#'
    });
    gather.say('Enter the new IP for dtmf.karlcswanson.com then press #');

    return twimlout.toString();
}

function backToRoot() {
    const twimlout = new VoiceResponse();
    twimlout.say({
        voice: 'woman',
        language: 'en-US'
    }, 'You have selected an invalid option.');
    twimlout.pause({
        length: 3
    });
    twimlout.redirect({
        method: 'GET'
    }, './join');
    return twimlout.toString();
}

async function getCurrentIP() {
    let ip;
    const options = {
        family: 4,
        hints: dns.ADDRCONFIG | dns.V4MAPPED,
    };
    
    await dnsPromises.lookup('dtmf.karlcswanson.com', options).then((result) => {
        ip = result.address;
    });
    return ip;
}


async function SetIP(digits) {
    return `${digits}`;
}


async function apiHandler(path, event) {
    let output;

    switch(path) {
        case "join": return topMenu();
            break;
        case "select": return selectOption(event.queryStringParameters.Digits);
            break;
        case "option1": return await optionOne();
            break;
        case "option2": return optionTwo();
            break;
        case "getip": return await getCurrentIP();
            break;
        case "gather2" : return await SetIP(event.queryStringParameters.Digits);
        default: return 'invalid path';
            break;
    }
}

exports.handler = async (event, context, callback) => {
    const output = await apiHandler(event.path.substring(1), event);
    const response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/xml',
        },
        body: output,
    };
    return response;
};