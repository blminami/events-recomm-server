const express = require('express');
const router = express.Router();
const https = require('https');
const mongo = require('mongoose');
const db = mongo.createConnection('localhost', 'AppLicenta', {
  native_parser: true
});

const sendNotification = function (data) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    Authorization: 'Basic NzVhYzI4NDEtZmM4Ni00ZTY3LTliNmYtYzY3OWQ2ZTUwNzMy'
  };

  const options = {
    host: 'onesignal.com',
    port: 443,
    path: '/api/v1/notifications',
    method: 'POST',
    headers: headers
  };

  const https = require('https');
  const req = https.request(options, function (res) {
    res.on('data', function (data) {});
  });

  req.on('error', function (e) {
    console.log('ERROR:');
    console.log(e);
  });

  req.write(JSON.stringify(data));
  req.end();
};

router.get('/:username/:secondUsername', function (req, res, next) {
  db.collection('users').findOne(
    { username: req.params.username },
    function (err, result) {
      if (err) console.log(err);
      if (result.pushNotifications === true) {
        const message = {
          app_id: '4831b06e-5ea7-42e3-8408-6e7ed8e1d49c',
          contents: {
            en:
              req.params.secondUsername + ' liked your event ' + req.query.event
          },
          include_player_ids: [result.playerId]
        };
        sendNotification(message);
      }
    }
  );
});

module.exports = router;
