const express = require('express');

const {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlaceById,
  deletePlace,
} = require('../controllers/places-controllers');

const router = express.Router();

router.get('/:pid', getPlaceById);

router.get('/user/:uid', getPlacesByUserId);

router.post('/', createPlace);

router.patch('/:pid', updatePlaceById);
 
router.delete('/:pid', deletePlace);

module.exports = router;
