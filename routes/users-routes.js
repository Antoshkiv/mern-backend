const express = require('express');
const { check } = require('express-validator');

const {
  getUsers,
  signUpUser,
  login,
} = require('../controllers/users-controllers');

const router = express.Router();

router.get('/', getUsers);

router.post('/signup',
  [
    check('name').not().isEmpty(),
    check('email').isEmail()
      .trim()
      .normalizeEmail({ gmail_remove_dots: false }), 
    check('password').isLength({ min: 5 }),
  ],
  signUpUser
);

router.post('/login', login);

module.exports = router;
