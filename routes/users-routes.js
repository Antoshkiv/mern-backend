const express = require('express');

const {
  getUsers,
  signUpUser,
  login
} = require('../controllers/users-controllers');

const router = express.Router();

router.get('/', getUsers);

router.post('/signup', signUpUser);

router.post('/login', login); 

module.exports = router;
