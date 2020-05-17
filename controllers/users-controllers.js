const HttpError = require('../models/http-error');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const User = require('../models/user');

const getUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find({}, '-password');
  } catch (e) {
    return next(
      new HttpError('Fetching users failed, please try again later.')
    );
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signUpUser = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (e) {
    return next(new HttpError('Signing up failed please try again later', 500));
  }

  if (existingUser) {
    return next(
      new HttpError('User exists already, please login instead.', 422)
    );
  }

  const createNewUser = new User({
    name,
    email,
    img:
      'https://transcode2.app.engoo.com/image/fetch/f_auto,c_lfill,w_800,h_600,dpr_3/https://assets.app.engoo.com/images/KiXHEl8g6n4bIH7oXaIA0wH0d73I8NiEdizulkBn0JC.jpeg',
    password,
    places:[],
  });

  try {
    await createNewUser.save();
  } catch (e) {
    return next(new HttpError('Signing Up failed, please try again.', 500));
  }
  res.status(201).json({ user: createNewUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (e) {
    return next(new HttpError('Logging in failed please try again later', 500));
  }

  if (!existingUser || existingUser.password !== password) {
    return next(
      new HttpError('Invalid credentials, could not log you in.', 401)
    );
  }

  res.status(200).json({ message: 'Logged in!' });
};

exports.getUsers = getUsers;
exports.signUpUser = signUpUser;
exports.login = login;
