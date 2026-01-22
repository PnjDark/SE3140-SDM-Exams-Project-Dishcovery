// server/routes/dishes.js
const express = require('express');
const router = express.Router();
const promisePool = require('../db');

router.get('/', async (req, res) => { /* ... */ });
router.get('/:id', async (req, res) => { /* ... */ });
router.get('/restaurant/:restaurantId', async (req, res) => { /* ... */ });

module.exports = router;
