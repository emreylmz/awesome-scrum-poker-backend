const express = require('express');
const router = express.Router();

const STORY_STATUS = require('../enums/storyStatus');

const Story = require('../models/Story');
const Voter = require('../models/Voter');

const checkEndVotingFields = (req, res, next) => {
  const { storyId, point } = req.body;


  const { voterId, sprintId } = req.session;

  if (!storyId || !point) {
    return res.status(400).json({ error: 'Missing parameter storyId or point!' });
  }

  if (!voterId) {
    return res.status(401).json({ error: "You don't have permission!" });
  }

  if (!sprintId) {
    return res.status(404).json({ error: "Sprint not found!" });
  }

  next();
};

router.post('/endVoting', checkEndVotingFields, async (req, res) => {
  try {
    const { storyId, point } = req.body;

    const { sprintId, voterId } = req.session;

    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({ error: 'Story Not Found!' });
    }

    const currentVoter = await Voter.findById(voterId);
    if (!currentVoter.isScrumMaster) {
      return res.status(400).json({ error: "You dont't have permission!" });
    }

    // Save point and change status to sprint
    story.point = point;
    story.status = STORY_STATUS.VOTED;
    await story.save();

    // Get sprint voters
    const voters = await Voter.find({ sprint: sprintId });

    // Reset voters points
    await Promise.all(voters.map(voter => {
      voter.point = undefined;
      return voter.save();
    }));

    const currentStoryOrder = story.orderInSprint;

    // Get all stories for sprint
    const stories = await Story.find({ sprint: sprintId });
    if (currentStoryOrder + 1 < stories.length) {
      // Set next story status to ACTIVE
      const nextStoryOrder = currentStoryOrder + 1;
      const nextStory = stories.find(story => story.orderInSprint === nextStoryOrder);
      nextStory.status = STORY_STATUS.ACTIVE;
      await nextStory.save();
    }

    return res.status(200).json({ success: 'Success' });
  } catch (err) {
    res.status(400).json({ error: 'There was an error!' })
  }
});

module.exports = router;
