const express = require('express');
const router = express.Router();
const Events = require('../models/events.js');
const multer = require('multer');
const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: '',
  api_key: '',
  api_secret: ''
});

router.post('/', function (req, res, next) {
  Events.create(req.body)
    .then(() => res.status(200).send('created'))
    .catch((err) => next(err));
});

router.put('/:idEvent', (req, res, next) => {
  Events.findByIdAndUpdate(req.params.idEvent, req.body)
    .then((event) => res.status(200).send('Updated'))
    .catch((err) => next(err));
});

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads/');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});

const upload = multer({ storage: storage }).single('file');

router.post('/uploadFile', function (req, res, next) {
  upload(req, res, function (err) {
    if (err) {
      return res.status(422).send('an Error occurred');
    } else {
      cloudinary.uploader.upload(
        req.file.path,
        function (result) {
          res.status(200).send(result);
        },
        {
          public_id: req.file.originalname
        }
      );
    }
  });
});

router.get('/', function (req, res, next) {
  Events.find({
    username: req.query.username
  })
    .then((events) => {
      res.status(200).send(events);
    })
    .catch((err) => next(err));
});

router.delete('/', function (req, res, next) {
  Events.findByIdAndRemove(req.query.id)
    .then(() => res.status(200).send('Event deleted'))
    .catch((err) => next(err));
});

module.exports = router;
