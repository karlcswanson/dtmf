const { VoiceResponse } = require('twilio').twiml;
const AWS = require('aws-sdk');
const dns = require('dns');

const route53 = new AWS.Route53({ apiVersion: '2013-04-01' });
const dnsPromises = dns.promises;

function topMenu() {
  const twimlout = new VoiceResponse();

  const gather = twimlout.gather({
    action: './select',
    method: 'GET',
    numDigits: '1',
  });
  gather.say('Hello! Welcome to DNS via DTMF.  Press 1 to get the current IP.  Press 2 to set a new IP.');

  return gather.toString();
}

function backToRoot() {
  const twimlout = new VoiceResponse();
  twimlout.say({
    voice: 'woman',
    language: 'en-US',
  }, 'You have selected an invalid option.');
  twimlout.pause({
    length: 3,
  });
  twimlout.redirect({
    method: 'GET',
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

function digitToIP(digits) {
  return digits.replace(/\*/g, '.');
}

async function updateR53Record(ip) {
  const params = {
    ChangeBatch: {
      Changes: [{
        Action: 'UPSERT',
        ResourceRecordSet: {
          Name: process.env.DTMF_DOMAIN_NAME,
          ResourceRecords: [{
            Value: ip,
          }],
          TTL: 60,
          Type: 'A',
        },
      }],
      Comment: 'Updated via DTMF',
    },
    HostedZoneId: process.env.HOSTED_ZONE_ID,
  };

  const res = await route53.changeResourceRecordSets(params).promise();

  console.log(res);
  return res;
}
async function SetIP(digit) {
  const ip = digitToIP(digit);
  const status = await updateR53Record(ip);

  const twimlout = new VoiceResponse();
  twimlout.say({
    voice: 'woman',
    language: 'en-US',
  }, 'IP has been updated!');
  twimlout.pause({
    length: 3,
  });
  twimlout.redirect({
    method: 'GET',
  }, './join');
  return twimlout.toString();
}

async function optionOne() {
  const twimlout = new VoiceResponse();
  const ip = await getCurrentIP();
  twimlout.say({
    voice: 'woman',
    language: 'en-US',
  }, `You have selected option 1.  The current IP is ${ip}`);
  twimlout.pause({
    length: 3,
  });
  twimlout.redirect({
    method: 'GET',
  }, './join');
  return twimlout.toString();
}

function optionTwo() {
  const twimlout = new VoiceResponse();

  const gather = twimlout.gather({
    action: './gather2',
    method: 'GET',
    finishOnKey: '#',
  });
  gather.say('Enter the new IP for dtmf dot karl c swanson dot com.  Use the star key for dots. Press pound when complete');

  return twimlout.toString();
}

function selectOption(digit) {
  const Digit = parseInt(digit, 10);
  switch (Digit) {
    case 1: return optionOne();
    case 2: return optionTwo();
    default:
      return backToRoot();
  }
}

async function apiHandler(path, event) {
  switch (path) {
    case 'join': return topMenu();
    case 'select': return selectOption(event.queryStringParameters.Digits);
    case 'option1': return optionOne();
    case 'option2': return optionTwo();
    case 'getip': return getCurrentIP();
    case 'gather2': return SetIP(event.queryStringParameters.Digits);
    default: return 'invalid path';
  }
}

exports.handler = async (event, context) => {
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
