const express = require('express');
const { getConfig, updateConfig } = require('../controllers/configController');
const { protect, authorize } = require('../middleware/auth');
const { validate, configSchema } = require('../middleware/validation');

const router = express.Router();

router.get('/', protect, authorize('admin'), getConfig);
router.put('/', protect, authorize('admin'), validate(configSchema), updateConfig);

module.exports = router;