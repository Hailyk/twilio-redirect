'use strict';
const config = require('./config.json');

const accountSid = process.env.accountSid||config.accountSid;
const authToken = process.env.authToken||config.authToken;
const phoneNumber = process.env.phoneNumber||config.phoneNumber;
const ownerNumber = process.env.ownerNumber||config.ownerNumber;

const port = process.env.PORT;

const http = require('http');
const express = require('express');
const twilio = require('twilio');

const client = twilio(accountSid, authToken);
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.post('/sms', (req, res) => {
        
    let body = req.body;
    
    if(body.From == ownerNumber){
        let message = body.Body;
        let response = message.slice(15,message.length);
        
        let number = message.slice(1,13);
        console.log(number+":"+response);
        client.messages.create({
            to: number,
            from: phoneNumber,
            body: response
        }).then((meta)=>{
            console.log(meta.sid);
            res.type('text/xml').send("<Response></Response>");
        });
    }
    else{
        let response = "["+body.From+"]:"+body.Body;
        
        client.messages.create({
            to: ownerNumber,
            from: phoneNumber,
            body: response
        }).then((meta)=>{
            console.log(meta.sid);
            res.type('text/xml').send("<Response></Response>");
        });
    }
});

app.post('/call', (req, res)=>{
    let body = req.body;
    
    if(body.From == ownerNumber){
        res.type('text/xml');
        res.send("<Response><Gather input=\"dtmf\" action=\"/initcall\" method=\"POST\" numDigits=\"11\"><Say>Enter Number</Say></Gather><Say>No Number Entered, Goodbye!</Say></Response>");
    }
    else{
        res.type('text/xml');
        res.send("<Response><Dial callerId=\""+body.From+"\">"+ownerNumber+"</Dial></Response>");
    }
});

app.post('/initcall', (req, res)=>{
    let body = req.body;
    res.type('text/xml');
    res.send("<Response><Dial callerId=\""+phoneNumber+"\">"+body.Digits+"</Dial></Response>");
});

http.createServer(app).listen(port, () => {
    console.log('Express server listening on port '+ port);
});