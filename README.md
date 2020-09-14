# DynDNS via DTMF

Update your DNS records via phone!

## Features

* **Press 1** - Get current IP
* **Press 2** - Update IP.  When prompted, enter in a new IP.  Press *#* when complete

## Setup Notes

### AWS Setup

* Create a new AWS Lambda function via the AWS console
* Add a rest API by adding an API Gateway Trigger
  * Configure proxy integration
* Configure the following environmental variables for the Lambda function
  * `DTMF_DOMAIN_NAME` is the Route53 A record to update via dtmf
  * `HOSTED_ZONE_ID` is the Route53 zone ID where `DTMF_DOMAIN_NAME` resides
* Create IAM policy for Route53

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": "route53:ChangeResourceRecordSets",
            "Resource": "arn:aws:route53:::hostedzone/XXXXXXXXXXXXXX"
        },
        {
            "Sid": "VisualEditor1",
            "Effect": "Allow",
            "Action": "route53:ListHostedZones",
            "Resource": "*"
        },
        {
            "Sid": "VisualEditor2",
            "Effect": "Allow",
            "Action": "route53:ListResourceRecordSets",
            "Resource": "arn:aws:route53:::hostedzone/XXXXXXXXXXXXXX"
        }
    ]
}
```

* Attach policy to Lambda Role

### Twilio Setup

* Provision new number
* Point to API endpoint for lambda function

### Local Setup

Download project from github and install node dependencies.

```bash
git clone https://github.com/karlcswanson/dtmf.git
cd dtmf/
npm install
```

Compress and upload to AWS Lambda.

```bash
npm run pack
npm run push
```

## Future Feature Ideas

* Script IAM Policy creation and attachment to Lambda role
* Script API trigger creation
* Fax confirmation usig Twilio fax API
* IP input validation

## Notes

* [Packaging and updating Lambda code](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html#nodejs-package-codeonly)
* [Lambda Proxy Integrations](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html)
* [Route53 JS SDK - Change resource record sets](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Route53.html#changeResourceRecordSets-property)
