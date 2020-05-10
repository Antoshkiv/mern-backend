const HttpError = require('../models/http-error');
const { v4: uuidv4 } = require('uuid');

let DUMMY_USERS = [
  {
    id: 'u1',
    name: 'Dima Antoshkiv',
    email: 'antoshkiv-test@gmail.com',
    password: 'test',
  },
];

const getUsers = (req, res, next) => {
  res.status(200).json({ users: DUMMY_USERS });
};

const signUpUser = (req, res, next) => {
  const { name, email, password } = req.body;

  const hasUser = DUMMY_USERS.find((u) => u.email === email);

  if (hasUser) {
    return next(
      new HttpError('Could not create user, email already exists', 422)
    );
  }

  const createNewUser = {
    ud: uuidv4(),
    name,
    email,
    password,
  };

  DUMMY_USERS.push(createNewUser);

  res.status(201).json({ user: createNewUser });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  const identifiedUser = DUMMY_USERS.find((u) => u.email === email);
  if (!identifiedUser || identifiedUser.password !== password) {
    return next(
      new HttpError(
        'Could not identify user, credentials seem to be wrong',
        404
      )
    );
  }

  res.status(200).json({ message: 'Logged in!' });
};

exports.getUsers = getUsers;
exports.signUpUser = signUpUser;
exports.login = login;
