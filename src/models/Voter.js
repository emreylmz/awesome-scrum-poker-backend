const mongoose = require('mongoose');

const VoterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 1,
    max: 200
  },
  sprint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint',
    required: true
  },
  point: Number,
  orderInSprint: {
    type: Number,
    required: true
  },
  isScrumMaster: Boolean
});

const Voter = mongoose.model('Voter', VoterSchema);

module.exports = Voter;
