const express = require('express');
const router = express.Router();

const STORY_STATUS = require('../enums/storyStatus');

const Sprint = require('../models/Sprint');
const Story = require('../models/Story');
const Voter = require('../models/Voter');

const storyToModel = (story) => {
  return story && {
    id: story._id,
    title: story.title,
    point: story.point,
    status: story.status,
    orderInSprint: story.orderInSprint,
  }
};

const voterToModel = (voter, everyOneVoted) => {
  return voter && {
    id: voter._id,
    name: voter.name,
    point: everyOneVoted ? voter.point : undefined,
    voted: !!voter.point,
    orderInSprint: voter.orderInSprint,
    isScrumMaster: voter.isScrumMaster
  }
};

const getSprintModel = (sprint, voters, stories, isScrumMaster) => {
  const activeStory = stories && stories.find(story => story.status === STORY_STATUS.ACTIVE);
  const sprintModel = {
    id: sprint._id,
    name: sprint.name,
    activeStory: storyToModel(activeStory),
    storyList: stories && stories
      .sort((story1, story2) => story1.orderInSprint < story2.orderInSprint ? -1 : 1)
      .map(storyToModel)
  };

  if (isScrumMaster) {
    const everyOneVoted = !voters.some(voter => !voter.point);
    sprintModel.numberOfVoters = sprint.numberOfVoters;
    sprintModel.voterList = voters && voters
      .sort((voter1, voter2) => voter1.orderInSprint < voter2.orderInSprint ? -1 : 1)
      .map(voter => voterToModel(voter, everyOneVoted));
  }
  return sprintModel;
};

const checkStartFields = (req, res, next) => {
  const { sprintName, numberOfVoters, stories } = req.body;
  if (!sprintName || !numberOfVoters || !stories) {
    return res.status(400).json({ error: 'Fill all field!' });
  }

  if (sprintName.length <= 0 || sprintName.length > 200) {
    return res.status(400).json({ error: 'Sprint name should be at most 200 character or not empty!' });
  }

  if ((+numberOfVoters) <= 0) {
    return res.status(400).json({ error: 'Number of voters should be more than 0!' });
  }

  if (stories.length <= 0) {
    return res.status(400).json({ error: 'There must be at least one Story!' });
  }

  next();
};

const checkGetFields = (req, res, next) => {
  const { sprintId } = req.query;

  if (!sprintId) {
    return res.status(404).json({ error: 'Sprint Not Found!' });
  }

  next();
};

router.post('/start', checkStartFields, async (req, res) => {
  try {
    const { sprintName, numberOfVoters, stories } = req.body;

    // Create sprint
    const sprint = new Sprint({
      name: sprintName,
      numberOfVoters: numberOfVoters
    });

    const savedSprint = await sprint.save();

    // Create stories
    const savedStories = await Promise.all(stories.map((story, index) => {
      const storyModel = new Story({
        title: story,
        sprint: sprint._id,
        orderInSprint: index,
        status: index === 0 ? STORY_STATUS.ACTIVE : STORY_STATUS.NOT_VOTED
      });
      return storyModel.save();
    }));

    // Create scrum master voter
    const scrumMasterVoter = new Voter({
      name: 'Scrum Master',
      sprint: savedSprint._id,
      orderInSprint: savedSprint.numberOfVoters - 1,
      isScrumMaster: true
    });

    const savedScrumMasterVoter = await scrumMasterVoter.save();

    const sprintModel = getSprintModel(sprint, [savedScrumMasterVoter], savedStories, true);

    req.session.sprintId = sprint._id;
    req.session.voterId = savedScrumMasterVoter._id;

    return res.status(200).json(sprintModel);
  } catch (err) {
    res.status(400).json({ error: 'There was an error!' })
  }
});

router.post('/end', (req, res) => {
  res.json({ message: 'Welcome' });
});

router.get('/get', checkGetFields, async (req, res) => {
  try {
    const { sprintId } = req.query;
    const { voterId } = req.session;

    // Get sprint
    const sprint = await Sprint.findById(sprintId);

    if (!sprint) {
      return res.status(404).json({ error: 'Sprint Not Found!' });
    }

    // Get voters and stories
    const voters = await Voter.find({ sprint: sprintId });
    const stories = await Story.find({ sprint: sprintId });

    if (voterId) {
      const currentVoter = await Voter.findById(voterId);
      if (!currentVoter) {
        return res.status(404).json({ error: 'Voter Not Found!' });
      }

      if (currentVoter.sprint.toString() !== sprint._id.toString()) {
        return res.status(400).json({ error: 'Voter is not include to this sprint!' });
      }

      const sprintModel = getSprintModel(sprint, voters, stories, currentVoter.isScrumMaster);
      return res.status(200).json(sprintModel);
    }

    // Check voter count for sprint
    if (voters && voters.length >= sprint.numberOfVoters) {
      return res.status(400).json({ error: 'Sprint voter count is full!' });
    }

    // Create new voter
    const newVoter = new Voter({
      name: `Voter ${voters.length || 0}`,
      sprint: sprintId,
      orderInSprint: voters.length - 1
    });
    const savedVoter = await newVoter.save();

    // Get all voters for sprint
    const newVoters = await Voter.find({ sprint: sprintId });
    const sprintModel = getSprintModel(sprint, newVoters, stories);

    req.session.voterId = savedVoter._id;

    return res.status(200).json(sprintModel);
  } catch (err) {
    res.status(400).json({ error: 'There was an error!' })
  }
});

module.exports = router;
