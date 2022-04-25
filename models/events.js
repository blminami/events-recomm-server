var mongoose = require('mongoose');

var eventSchema = new mongoose.Schema({
  name: String,
  coverPicture: String,
  profilePicture: String,
  description: String,
  startTime: Date,
  endTime: Date,
  category: String,
  ticketing: {
    ticket_uri: String
  },
  venue: {
    location: {
      city: String,
      country: String,
      street: String,
      latitude: Number,
      longitude: Number,
      coord: {
        type: [Number],
        index: '2d'
      }
    },
    categoryList: []
  },
  place: {
    name: String,
    location: {
      city: String
    }
  },
  email: String,
  username: String,
  newEvent: Boolean
});

module.exports = mongoose.model('Event', eventSchema);
