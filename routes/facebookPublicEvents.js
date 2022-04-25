const express = require('express');
const router = express.Router();
const cors = require('cors');
const EventSearch = require('facebook-events-by-location-core');

const whitelist = [],
  enableAll = false;

// Check if FEBL_CORS_WHITELIST exists
if (process.env.FEBL_CORS_WHITELIST) {
  if (process.env.FEBL_CORS_WHITELIST.indexOf(',') > -1) {
    // Add custom whitelisted domains
    whitelist = whitelist.concat(process.env.FEBL_CORS_WHITELIST.split(','));
  } else {
    // Just push the FEBL_CORS_WHITELIST value
    whitelist.push(process.env.FEBL_CORS_WHITELIST);
  }
  // Otherwise enable all origins
} else {
  enableAll = true;
}

// CORS middleware handler
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.length > 0) {
      const originIsWhitelisted = whitelist.indexOf(origin) !== -1;
      callback(null, originIsWhitelisted);
    } else if (enableAll) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  }
};

// Main route
router.get('/', cors(corsOptions), function (req, res) {
  if (!req.query.lat || !req.query.lng) {
    res
      .status(500)
      .json({ message: 'Please specify the lat and lng parameters!' });
  } else if (!req.query.accessToken && !process.env.FEBL_ACCESS_TOKEN) {
    res
      .status(500)
      .json({
        message:
          'Please specify an Access Token, either as environment constiable or as accessToken parameter!'
      });
  } else {
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
      options.categories = categories;
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
    if (req.query.until) {
      options.until = req.query.until;
    }
    if (req.query.showActiveOnly && req.query.showActiveOnly === 'false') {
      options.showActiveOnly = Boolean(req.query.showActiveOnly);
    }

    // Instantiate EventSearch
    const es = new EventSearch();

    // Search and handle results
    es.search(options)
      .then(function (events) {
        res.json(events);
      })
      .catch(function (error) {
        res.status(500).json(error);
      });
  }
});

module.exports = router;
