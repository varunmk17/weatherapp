'use strict';

var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var cors = require('cors');
var sgMail = require('@sendgrid/mail');
var _ = require('lodash');
var moment = require('moment');

var app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('./public'));

var lstOfRainConditions = ['Thunderstorm', 'Drizzle', 'Rain'];

app.get('/api/v1/weather', function (req, res) {
    var requestString = 'https://api.openweathermap.org/data/2.5/weather?q=632602&appid=' + process.env.OPENWEATHER_API_KEY;
    request(requestString, function (error, response, body) {
        res.status(201).send(JSON.parse(body));
    });
});

//API: POST/ GET FORECAST
app.post('/api/v1/weather', function (req, res) {
    if (!req.body) return res.sendStatus(400)

    var zipcode = req.body.zipcode;
    var requestString = 'https://api.openweathermap.org/data/2.5/weather?q=' + zipcode + '&units=imperial&appid=' + process.env.OPENWEATHER_API_KEY;

    request(requestString, function (error, response, body) {
        var jsonGeo = JSON.parse(body);
        res.status(201).send(jsonGeo);
    });
});

setInterval(function () {
    var requestString = 'https://api.openweathermap.org/data/2.5/forecast?q=07306&units=imperial&appid=' + process.env.OPENWEATHER_API_KEY;
    var reqs = request(requestString, function (error, response, body) {
        var jsonGeo = JSON.parse(body);
        var todayForecast = _.filter(jsonGeo.list, (val) => {
            if(moment(val.dt_txt).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD') && _.indexOf(lstOfRainConditions, val.weather[0].main) > 0) {
                return val;
            }
        });
        
        if(todayForecast.length > 0) {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            const msg = {
                to: 'varunmk17@gmail.com',
                from: 'avakas@yopmail.com',
                subject: 'Bring your umbrella - Its gonna rain today',
                html: '<strong>' + todayForecast[0].weather[0].main + '</strong>',
            };
            sgMail.send(msg);
        }
    });
}, 5000); 

module.exports = app;