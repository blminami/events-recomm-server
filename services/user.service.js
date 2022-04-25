const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Q = require('q');
const mongo = require('mongoose');
const db = mongo.createConnection('localhost', 'AppLicenta', {
  native_parser: true
});

const service = { authenticate, getAll, getById, create };

service.authenticate = authenticate;
service.getAll = getAll;
service.getById = getById;
service.create = create;

module.exports = service;

function authenticate(username, password) {
  const deferred = Q.defer();
  db.collection('users').findOne({ username: username }, function (err, user) {
    if (err) {
      deferred.reject(err.name + ': ' + err.message);
    }
    if (user && bcrypt.compareSync(password, user.hash)) {
      // authentication successful
      deferred.resolve({
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: jwt.sign({ sub: user._id }, 'string'),
        address: user.address,
        phoneNumber: user.phoneNumber,
        countryCode: user.countryCode,
        imgUrl: user.imgUrl,
        playerId: user.playerId,
        pushNotifications: user.pushNotifications
      });
    } else {
      // authentication failed
      deferred.resolve();
    }
  });
  return deferred.promise;
}

function getAll() {
  const deferred = Q.defer();

  db.collection('users')
    .find()
    .toArray(function (err, users) {
      if (err) {
        deferred.reject(err.name + ': ' + err.message);
      }

      // return users (without hashed passwords)
      users = _.map(users, function (user) {
        return _.omit(user, 'hash');
      });

      deferred.resolve(users);
    });

  return deferred.promise;
}

function getById(_id) {
  const deferred = Q.defer();

  db.collection('users').findById(_id, function (err, user) {
    if (err) {
      deferred.reject(err.name + ': ' + err.message);
    }

    if (user) {
      // return user (without hashed password)
      deferred.resolve(_.omit(user, 'hash'));
    } else {
      // user not found
      deferred.resolve();
    }
  });

  return deferred.promise;
}

function create(userParam) {
  const deferred = Q.defer();
  // validation
  db.collection('users').findOne(
    { username: userParam.username },
    function (err, user) {
      if (err) {
        deferred.reject(err.name + ': ' + err.message);
      }
      if (user) {
        // username already exists
        deferred.reject(
          'Username "' + userParam.username + '" is already taken'
        );
      } else {
        createUser();
      }
    }
  );

  function createUser() {
    // set user object to userParam without the cleartext password
    const user = _.omit(userParam, 'password');

    // add hashed password to user object
    user.hash = bcrypt.hashSync(userParam.password, 10);

    db.collection('users').insert(user, function (err, doc) {
      if (err) {
        deferred.reject(err.name + ': ' + err.message);
      }

      deferred.resolve();
    });
  }
  return deferred.promise;
}
