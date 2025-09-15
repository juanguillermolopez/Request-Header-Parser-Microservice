const mongoose = require('mongoose');

const requestLogSchema = new mongoose.Schema({
  ipaddress: String,
  language: String,
  software: String,
  headers: Object,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RequestLog', requestLogSchema);