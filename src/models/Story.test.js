const mongoose = require('mongoose');
const Story = require('./Story');
const storyData = { title: 'Story 1', sprint: mongoose.Types.ObjectId(), point: 1, status: 0, orderInSprint: 0 };

describe('Voter Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__,
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
      }, (err) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }
      });
  });

  it('should create and save voter successfully', async () => {
    const storyModel = new Story(storyData);
    const savedStory = await storyModel.save();

    expect(savedStory._id).toBeDefined();
    expect(savedStory.name).toBe(storyData.name);
    expect(savedStory.sprint).toBe(storyData.sprint);
    expect(savedStory.point).toBe(storyData.point);
    expect(savedStory.status).toBe(storyData.status);
    expect(savedStory.orderInSprint).toBe(storyData.orderInSprint);
  });

  it('should not save field that does not defined in schema', async () => {
    const storyWithInValidField = new Story({ ...storyData, info: 'First story.' });
    const storyVoterWithInValidField = await storyWithInValidField.save();
    expect(storyVoterWithInValidField._id).toBeDefined();
    expect(storyVoterWithInValidField.info).toBeUndefined();
  });


  it('should failed when create user without required', async () => {
    const voterWithoutRequiredField = new Story({ name: 'Test Voter' });
    let err;
    try {
      err = await voterWithoutRequiredField.save();
    } catch (error) {
      err = error
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.orderInSprint).toBeDefined();
  });
});
