const VoiceResponse = require('twilio').twiml.VoiceResponse;

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
    // return `digit ${digit}`;
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

function optionOne() {
    const response = new VoiceResponse();
    response.say({
        voice: 'woman',
        language: 'en-US'
    }, 'You have selected option 1');
    return response.toString();
}

function optionTwo() {
    const response = new VoiceResponse();
    response.say({
        voice: 'woman',
        language: 'en-US'
    }, 'You have selected option 2');
    return response.toString();
}

function backToRoot() {
    const response = new VoiceResponse();
    response.say({
        voice: 'woman',
        language: 'en-US'
    }, 'You have selected an invalid option.');
    response.pause({
        length: 3
    });
    response.redirect({
        method: 'GET'
    }, './join');
    return response.toString();
}

function getCurrentIP() {
    return;
}

function SetIP() {
    return;
}


function apiHandler(path, event) {
    let output;

    switch(path) {
        case "join": return topMenu();
            break;
        case "select": return selectOption(event.queryStringParameters.Digits);
            break;
        case "option1": return optionOne();
            break;
        case "option2": return optionTwo();
            break;
        default: return 'invalid path';
            break;
    }
}

exports.handler = async (event, context, callback) => {
    const output = apiHandler(event.path.substring(1), event);
    const response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/xml',
        },
        body: output,
    };
    return response;
};