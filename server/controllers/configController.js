const Config = require('../models/Config');

// @desc    Get system configuration
// @route   GET /api/config
// @access  Private/Admin
const getConfig = async (req, res) => {
  try {
    const config = await Config.getConfig();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update system configuration
// @route   PUT /api/config
// @access  Private/Admin
const updateConfig = async (req, res) => {
  try {
    let config = await Config.findOne();

    if (!config) {
      config = await Config.create(req.body);
    } else {
      config = await Config.findByIdAndUpdate(
        config._id,
        req.body,
        { new: true, runValidators: true }
      );
    }

    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getConfig,
  updateConfig
};