const express = require('express');
const got = require('got');

const Idea = require('./Ideas.model.js');
const { getAccessToken } = require('./utils.js');
const ideaRouter = express.Router();

async function createTimeLineEvent (idea) {
  const accessToken = await getAccessToken(1);
  try {
    await got(
      `http://hubspot_service:8080/api/timeline/${accessToken}`,
      { method: 'POST', json: { idea } }
    );
  } catch (err) {
    console.log(err);
  }
}

ideaRouter.get('/', async (req, res, next) => {
  try {
    const allIdeas = await Idea.find({}).populate('author').exec();

    res.send(allIdeas);
  } catch (err) {
    next(err);
  }
});

ideaRouter.post('/', async (req, res, next) => {
  const idea = req.body;
  console.log(idea);
  try {
    const dbResponse = await Idea.create(idea);
    const populatedIdea = await dbResponse.populate('author').execPopulate();
    res.send(populatedIdea);
    createTimeLineEvent(populatedIdea);
  } catch (err) {
    next(err);
  }
});

ideaRouter.delete('/', async (req, res, next) => {
  try {
    await Idea.deleteMany({});
    res.send('All Ideas deleted');
  } catch (err) {
    next(err);
  }
});

module.exports = ideaRouter;