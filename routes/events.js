var express = require('express');
var router = express.Router();
var mongo = require('mongoose');
var Events = require('../models/events.js');
var EventSearch = require('facebook-events-by-location-core');

//search events in the address
router.get('/address', function (req, res, next) {
  if (!req.query.accessToken && !process.env.FEBL_ACCESS_TOKEN) {
    res.status(500).json({
      message:
        'Please specify an Access Token, either as environment variable or as accessToken parameter!'
    });
  } else {
    var resultArray = [];
    var query = {};
    var operator = {};
    var operator1 = {};
    var field = 'venue.location.coord';
    operator1['$centerSphere'] = [[req.query.lng, req.query.lat], 1 / 6378.1];
    operator['$geoWithin'] = operator1;
    query[field] = operator;

    if (req.query.categories) {
      var field = 'venue.categoryList';
      var operator = {};
      operator['$in'] = [req.query.categories];
      query[field] = operator;
    }
    if (req.query.since) {
      var field = 'startTime';
      var operator = {};
      operator['$gte'] = new Date(req.query.since);
      query[field] = operator;
    }
    if (req.query.until) {
      var field = 'endTime';
      var operator = {};
      operator['$lte'] = new Date(req.query.until);
      query[field] = operator;
    }
    // Address with coordonates: latitude and longitude
    //Get all events nearby this location
    //1. From local db
    Events.find(query)
      .then((events) => {
        if (events && events.length > 0) {
          events.forEach((element) => {
            resultArray.push(element);
          });
        }

        // //2. From facebook public events

        const options = {};

        // Add latitude
        if (req.query.lat) {
          options.lat = req.query.lat;
        }
        if (req.query.lng) {
          options.lng = req.query.lng;
        }
        if (req.query.distance) {
          options.distance = req.query.distance;
        }
        if (req.query.accessToken) {
          options.accessToken = req.query.accessToken;
        } else {
          options.accessToken = process.env.FEBL_ACCESS_TOKEN || null;
        }
        if (req.query.query) {
          options.query = req.query.query;
        }
        if (req.query.categories) {
          const categories = [];
          if (req.query.categories.length > 0) {
            if (req.query.categories.indexOf(',') > -1) {
              categories = req.query.categories.split(',');
            } else {
              categories.push(req.query.categories);
            }
          }
          if (categories.length > 0) options.categories = categories;
        }
        if (req.query.sort) {
          options.sort = req.query.sort;
        }
        if (req.query.version) {
          options.version = req.query.version;
        }
        if (req.query.since) {
          options.since = req.query.since;
        }
        if (req.query.until && req.query.until !== req.query.since) {
          options.until = req.query.until;
        }
        if (req.query.showActiveOnly && req.query.showActiveOnly === 'false') {
          options.showActiveOnly = Boolean(req.query.showActiveOnly);
        }

        // Instantiate EventSearch
        var es = new EventSearch();
        // Search and handle results
        es.search(options)
          .then(function (events) {
            for (var i = 0; i < events.events.length; i++) {
              if (events.events[i].description !== null) {
                resultArray.push(events.events[i]);
              }
            }
            res.status(200).json(resultArray);
          })
          .catch(function (error) {
            res.status(500).json(error);
          });

        res.status(200).json(resultArray);
      })
      .catch((err) => next(err));
  }
});

//getAllEvents by category
router.get('/query/byCategory', function (req, res, next) {
  var date = new Date();
  if (!req.query.accessToken && !process.env.FEBL_ACCESS_TOKEN) {
    res.status(500).json({
      message:
        'Please specify an Access Token, either as environment variable or as accessToken parameter!'
    });
  } else {
    var categories = new Array();
    if (req.query.categories.length > 0) {
      if (req.query.categories.indexOf(',') > -1) {
        categories = req.query.categories.split(',');
      } else {
        categories.push(req.query.categories);
      }
    } else
      categories = [
        'ARTS_ENTERTAINMENT',
        'EDUCATION',
        'FITNESS_RECREATION',
        'FOOD_BEVERAGE',
        'HOTEL_LODGING',
        'MEDICAL_HEALTH',
        'SHOPPING_RETAIL',
        'TRAVEL_TRANSPORTATION'
      ];
    var resultArray = [];
    //1. From local db

    Events.find({
      'venue.location.coord': {
        $geoWithin: {
          $centerSphere: [[req.query.lng, req.query.lat], 1 / 6378.1]
        }
      },
      'venue.categoryList': { $in: categories },
      startTime: { $gte: date }
    })
      .then((events) => {
        if (events && events.length > 0) {
          events.forEach((element) => {
            resultArray.push(element);
          });
        }
        // //2. From facebook public events

        // var options = {};

        // // Add latitude
        // if (req.query.lat) {
        //     options.lat = req.query.lat;
        // }
        // if (req.query.lng) {
        //     options.lng = req.query.lng;
        // }
        // if (req.query.distance) {
        //     options.distance = req.query.distance;
        // }
        // if (req.query.accessToken) {
        //     options.accessToken = req.query.accessToken;
        // }
        // else {
        //     options.accessToken = process.env.FEBL_ACCESS_TOKEN || null;
        // }
        // if (req.query.query) {
        //     options.query = req.query.query;
        // }

        // options.categories = categories;

        // if (req.query.sort) {
        //     options.sort = req.query.sort;
        // }
        // if (req.query.version) {
        //     options.version = req.query.version;
        // }
        // if (req.query.since) {
        //     options.since = req.query.since;
        // }
        // if (req.query.until) {
        //     options.until = req.query.until;
        // }
        // if (req.query.showActiveOnly && req.query.showActiveOnly === "false") {
        //     options.showActiveOnly = Boolean(req.query.showActiveOnly);
        // }

        // // Instantiate EventSearch
        // var es = new EventSearch();

        // // Search and handle results
        // es.search(options).then(function (events) {

        //     for (var i = 0; i < events.events.length; i++) {
        //         if (events.events[i].description !== null) {
        //             resultArray.push(events.events[i])
        //         }
        //     }

        //     res.status(200).json(resultArray);
        // }).catch(function (error) {
        //     res.status(500).json(error);
        // });

        //De comentat dupa ce decomentez partea cu fb
        res.status(200).json(resultArray);
      })
      .catch((err) => next(err));
  }
});

router.get('/', function (req, res, next) {
  if (!req.query.accessToken && !process.env.FEBL_ACCESS_TOKEN) {
    res.status(500).json({
      message:
        'Please specify an Access Token, either as environment variable or as accessToken parameter!'
    });
  } else {
    var resultArray = [];
    var date = new Date();
    //1. From local db
    Events.find({
      'venue.location.coord': {
        $geoWithin: {
          $centerSphere: [[req.query.lng, req.query.lat], 1 / 6378.1]
        }
      },
      startTime: { $gte: date }
    })
      .then((events) => {
        if (events && events.length > 0) {
          events.forEach((element) => {
            resultArray.push(element);
          });
        }
        // //2. From facebook public events

        // var options = {};

        // // Add latitude
        // if (req.query.lat) {
        //     options.lat = req.query.lat;
        // }
        // if (req.query.lng) {
        //     options.lng = req.query.lng;
        // }
        // if (req.query.distance) {
        //     options.distance = req.query.distance;
        // }
        // if (req.query.accessToken) {
        //     options.accessToken = req.query.accessToken;
        // }
        // else {
        //     options.accessToken = process.env.FEBL_ACCESS_TOKEN || null;
        // }
        // if (req.query.query) {
        //     options.query = req.query.query;
        // }

        // var categories = ['ARTS_ENTERTAINMENT', 'EDUCATION', 'FITNESS_RECREATION', 'FOOD_BEVERAGE', 'HOTEL_LODGING', 'MEDICAL_HEALTH', 'SHOPPING_RETAIL', 'TRAVEL_TRANSPORTATION'];

        // options.categories = categories;

        // if (req.query.sort) {
        //     options.sort = req.query.sort;
        // }
        // if (req.query.version) {
        //     options.version = req.query.version;
        // }
        // if (req.query.since) {
        //     options.since = req.query.since;
        // }
        // if (req.query.until) {
        //     options.until = req.query.until;
        // }
        // if (req.query.showActiveOnly && req.query.showActiveOnly === "false") {
        //     options.showActiveOnly = Boolean(req.query.showActiveOnly);
        // }

        // // Instantiate EventSearch
        // var es = new EventSearch();

        // // Search and handle results
        // es.search(options).then(function (events) {
        //     console.log(events);
        //     for (var i = 0; i < events.events.length; i++) {

        //         if (events.events[i].description !== null) {
        //             resultArray.push(events.events[i])
        //         }
        //     }

        //     res.status(200).json(resultArray);
        // }).catch(function (error) {
        //     res.status(500).json(error);
        // });
        res.status(200).json(resultArray);
      })
      .catch((err) => next(err));
  }
});

module.exports = router;
