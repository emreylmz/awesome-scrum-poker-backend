const mongoose = require('mongoose');

const SprintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 1,
    max: 200
  },
  numberOfVoters: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  }
});

const Sprint = mongoose.model('Sprint', SprintSchema);

module.exports = Sprint;
