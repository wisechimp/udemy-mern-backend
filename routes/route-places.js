const express = require('express') // Could simply take { Router } from express...
const { check } = require('express-validator') // Like this!

const placeControllers = require('../controllers/controller-places')
const fileUpload = require("../middleware/file-upload");

const router = express.Router()

router.get('/:pid', placeControllers.getPlaceById)

router.get('/user/:uid', placeControllers.getPlacesByUserId)

// Not restricted to one middleware
// Actioned from left to right
router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title")
      .not()
      .isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address")
      .not()
      .isEmpty()
  ],
  placeControllers.createPlace
);

router.patch(
  "/:pid",
  [
    check("title")
      .not()
      .isEmpty(),
    check("description").isLength({ min: 5 })
  ],
  placeControllers.updatePlace
);

router.delete('/:pid', placeControllers.deletePlace)

module.exports = router