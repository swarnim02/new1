const express = require('express');
const router = express.Router();
const { analyzeCodeforcesStats } = require('../controllers/codeforcesStatsController');

router.get('/analyze/:handle', analyzeCodeforcesStats);

module.exports = router;
