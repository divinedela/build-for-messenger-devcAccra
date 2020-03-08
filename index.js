//Get facebook Page access token from environment file
const { PAGE_ACCESS_TOKEN } = require('./env');

const axios = require('axios');
const express = require("express");
const app = express();
app.use(express.json());


const port = 3000;
app.listen(port, () => console.log(`App listening on port ${port}!`));

app.get('/', (request, response) => {
    response.send({message: 'Welcome!'});
});


// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN =  '77687768'
      
    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
      
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
    
      // Checks the mode and token sent is correct
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        
        // Responds with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);      
      }
    }
  }); 
  
// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  
 
    let body = req.body;
  
    // Checks this is an event from a page subscription
    if (body.object === 'page') {
  
      // Iterates over each entry - there may be multiple if batched
      body.entry.forEach(function(entry) {

        // will only ever contain one message, so we get index 0
        let webhook_event = entry.messaging[0];
        console.log('webhook event ', webhook_event);

        // Get the sender PSID
        let sender_psid = webhook_event.sender.id;
        console.log('Sender PSID: ' + sender_psid);
        
        if (webhook_event.message) 
            handleMessage(sender_psid, webhook_event.message);         
      });
  
      // Returns a '200 OK' response to all requests
      res.status(200).send('EVENT_RECEIVED');
    } else {
      // Returns a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }
  
});

function handleMessage(sender_psid, received_message) {
    let response;
  
    // Checks if the message contains text
    if (received_message.text) {
      
      // Creates the payload for a basic text message, which
      // will be added to the body of our request to the Send API
      response = {
        "text": `You sent the message: "${received_message.text}". Now send me an attachment!`
      }
  
    } 
    // Sends the response message
    callSendAPI(sender_psid, response);    
}

function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": response
    }

    const sendMessageUri = `https://graph.facebook.com/v2.6/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
    axios.post(`${sendMessageUri}`, request_body)
        .then(res => console.log('message sent!', res))
        .catch(err => console.log(`ERROR: ${err}`));
}
