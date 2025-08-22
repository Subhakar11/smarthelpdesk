const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  autoCloseEnabled: {
    type: Boolean,
    default: true
  },
  confidenceThreshold: {
    type: Number,
    default: 0.7,
    min: 0,
    max: 1
  },
  slahours: {
    type: Number,
    default: 24
  }
}, {
  timestamps: true
});

// Only one config document should exist
configSchema.statics.getConfig = function() {
  return this.findOne().then(config => {
    if (!config) {
      return this.create({});
    }
    return config;
  });
};

module.exports = mongoose.model('Config', configSchema);