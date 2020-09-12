const VoiceResponse = require('twilio').twiml.VoiceResponse;

function topMenu() {
    const twimlout = new VoiceResponse();
    twimlout.say({
        voice: 'man',
        language: 'en-US'
    }, 'Press 1 to get current IP.  Press 2 to update IP.');
    return twimlout.toString();
}




exports.handler = async (event) => {
    const output = topMenu();
    const response = {
        statusCode: 200,
        body: output,
    };
    return response;
};