const express = require('express');
const { getCoffeeMenu } = require('../controllers/coffieList');
const router = express.Router();

// GET kaffemenyn
router.get('/menu', getCoffeeMenu);

module.exports = router;
