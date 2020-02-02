const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    min: 1,
    max: 1024
  },
  sprint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint'
  },
  point: Number,
  status: {
    type: Number,
    default: 0
  },
  orderInSprint: {
    type: Number,
    required: true
  }
});

const Story = mongoose.model('Story', StorySchema);

module.exports = Story;
