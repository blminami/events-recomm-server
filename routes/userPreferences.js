const express = require('express');
const router = express.Router();
const mongo = require('mongoose');
const Preference = require('../models/userPreferences.js');
const db = mongo.createConnection('localhost', 'AppLicenta', { native_parser: true });

//if trigger === 1 get all events liked by the user 
//else if trigger  === 2 get all the events attended by the user
//else if trigger === 3 get all 'to attend' events
router.get('/:username/:trigger', function (req, res, next) {
    if (req.params.trigger === "1") {
        Preference.find({ username: req.params.username, status: "liked" })
            .then((events) => {
                if (events && events.length > 0) {
                    res.status(200).json(events);
                }
                else {
                    res.status(404).send("No event found");
                }
            })
            .catch((err) => {
                next(err);
            });
    }
    else if (req.params.trigger === "2") {
        Preference.find({ username: req.params.username, status: "attended" })
            .then((events) => {
                if (events && events.length > 0) {
                    res.status(200).json(events);
                }
                else {
                    res.status(404).send("No event found");
                }
            })
            .catch((err) => {
                next(err);
            });
    }
    else if (req.params.trigger === "3") {
        Preference.find({ username: req.params.username, status: "to attend" })
            .then((events) => {
                if (events && events.length > 0) {
                    res.status(200).json(events);
                }
                else {
                    res.status(404).send("No event found");
                }
            })
            .catch((err) => {
                next(err);
            });
    }
});


//get events by username and category
router.get('/:username', function (req, res, next) {

    Preference.find({ username: req.params.username, status: "liked" })
        .then((events) => {
            res.status(200).json(events);
        })
        .catch((err) => {
            next(err);
        });
});


//create a new record
router.post('/', function (req, res, next) {
    Preference.create(req.body)
        .then(() => res.status(200).send("Created"))
        .catch((err) => next(err));
});


//delete an event - dislike
router.delete('/:username/:name/:startDate/:endDate', function (req, res, next) {
    Preference.deleteOne({
        username: req.params.username, status: "liked",
        name: req.params.name,
        startTime: req.params.startDate,
        endTime: req.params.endDate
    })
        .then(() => res.status(200).send("Event deleted"))
        .catch((err) => next(err));
});

router.delete('/:username', function (req, res, next) {
    Preference.deleteMany({
    })
        .then(() => res.status(200).send("Events deleted"))
        .catch((err) => next(err));
});

router.get('/:username/getEventBy/:name/:startDate/:endDate', function (req, res, next) {

    // console.log(req.params);
    Preference.find({
        username: req.params.username, status: "liked",
        name: req.params.name,
        startTime: req.params.startDate,
        endTime: req.params.endDate
    })
        .then((event) => {
            res.status(200).json(event);
        })
        .catch((err) => {
            next(err);
        });
});

//Get count events where status = liked
router.get('/:name/:startDate/:endDate', function (req, res, next) {
    const count = {};
    Preference.find({
        name: req.params.name,
        startTime: req.params.startDate,
        endTime: req.params.endDate
    }).count()
        .then((count1) => {

           
            count.countEvent = count1;

            Preference.find({}).count()
                .then((count2) => {
                    count.totalCount = count2;
                    res.status(200).json(count);
                })
                .catch((err) => {
                    next(err);
                });
        })
        .catch((err) => {
            next(err);
        });
});



module.exports = router;
