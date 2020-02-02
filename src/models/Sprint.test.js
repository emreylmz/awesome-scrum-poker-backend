const mongoose = require('mongoose');
const Sprint = require('./Sprint');
const sprintData = { name: 'Sprint 1', numberOfVoters: 4, isActive: true };

describe('User Model Test', () => {
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

  it('should create and save sprint successfully', async () => {
    const sprintModel = new Sprint(sprintData);
    const savedSprint = await sprintModel.save();

    expect(savedSprint._id).toBeDefined();
    expect(savedSprint.name).toBe(sprintData.name);
    expect(savedSprint.numberOfVoters).toBe(sprintData.numberOfVoters);
    expect(savedSprint.isActive).toBe(sprintData.isActive);
  });

  it('should not save field that does not defined in schema', async () => {
    const sprintWithInValidField = new Sprint({ ...sprintData, info: 'First sprint.' });
    const sprintVoterWithInValidField = await sprintWithInValidField.save();
    expect(sprintVoterWithInValidField._id).toBeDefined();
    expect(sprintVoterWithInValidField.info).toBeUndefined();
  });

  it('should failed when create user without required', async () => {
    const sprintWithoutRequiredField = new Sprint({ name: 'Test Sprint' });
    let err;
    try {
      err = await sprintWithoutRequiredField.save();
    } catch (error) {
      err = error
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.numberOfVoters).toBeDefined();
  });
});
