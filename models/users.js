var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  _id: String,
  firstName: String,
  lastName: String,
  username: String,
  imgUrl: String,
  token: String,
  phoneNumber: String,
  countryCode: String,
  address: String,
  playerId: String,
  pushNotifications: Boolean
});

module.exports = mongoose.model('User', userSchema);
