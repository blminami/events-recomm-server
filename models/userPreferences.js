var mongoose = require('mongoose');

var historySchema = new mongoose.Schema({
  username: String,
  name: String,
  profilePicture: String,
  coverPicture: String,
  description: String,
  startTime: String,
  endTime: String,
  ticketing: {
    ticket_uri: String
  },
  distance: String,
  place: {
    name: String
  },
  venue: {
    name: String,
    location: {
      city: String,
      country: String,
      street: String,
      latitude: Number,
      longitude: Number
    },
    categoryList: []
  },
  status: String,
  newEvent: Boolean
});

module.exports = mongoose.model('Preferences', historySchema);
