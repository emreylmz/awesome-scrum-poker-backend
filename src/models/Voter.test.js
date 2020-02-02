const mongoose = require('mongoose');
const Voter = require('./Voter');
const voterData = { name: 'Voter 1', sprint: mongoose.Types.ObjectId(), point: 1, orderInSprint: 0, isScrumMaster: false };

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
    const voterModel = new Voter(voterData);
    const savedVoter = await voterModel.save();

    expect(savedVoter._id).toBeDefined();
    expect(savedVoter.name).toBe(voterData.name);
    expect(savedVoter.sprint).toBe(voterData.sprint);
    expect(savedVoter.point).toBe(voterData.point);
    expect(savedVoter.orderInSprint).toBe(voterData.orderInSprint);
    expect(savedVoter.isScrumMaster).toBe(voterData.isScrumMaster);
  });

  it('should not save field that does not defined in schema', async () => {
    const voterWithInValidField = new Voter({ ...voterData, age: 25 });
    const savedVoterWithInValidField = await voterWithInValidField.save();
    expect(savedVoterWithInValidField._id).toBeDefined();
    expect(savedVoterWithInValidField.age).toBeUndefined();
  });

  it('should failed when create user without required', async () => {
    const voterWithoutRequiredField = new Voter({ name: 'Test Voter' });
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
