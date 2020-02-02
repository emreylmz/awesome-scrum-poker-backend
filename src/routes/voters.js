const express = require('express');
const router = express.Router();

const Voter = require('../models/Voter');

const checkVoteFields = (req, res, next) => {
  const { point } = req.body;

  const { voterId, sprintId } = req.session;

  if (!point) {
    return res.status(400).json({ error: 'Missing parameter storyId or point!' });
  }

  if (!voterId || !sprintId) {
    return res.status(404).json({ error: 'Sprint Not Found!' });
  }

  next();
};

router.post('/vote', checkVoteFields, async (req, res) => {
  try {
    const { point } = req.body;

    const { voterId, sprintId } = req.session;

    const voter = await Voter.findById(voterId);

    if (!voter) {
      return res.status(404).json({ error: 'Voter Not Found!' });
    }

    if (voter.sprint.toString() !== sprintId.toString()) {
      return res.status(404).json({ error: 'Voter is not included to sprint!' });
    }

    voter.point = point;
    await voter.save();

    return res.status(200).json({ success: 'Success' })
  } catch (err) {
    res.status(400).json({ error: 'There was an error!' })
  }
});

module.exports = router;
