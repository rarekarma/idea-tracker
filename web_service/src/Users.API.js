const express = require('express');
const got = require('got').default;
const Users = require('./Users.model.js');
const Faction = require('./Factions.model.js');
const { getAccessToken } = require('./utils.js');
const userRouter = express.Router();

async function updateContactOnSave (contactToUpdate) {
  const accessToken = await getAccessToken(1);
  try {
    await got(
      `http://hubspot_service:8080/api/contacts/update-one/${accessToken}`,
      { method: 'PUT', json: { contactToUpdate } }
    );
  } catch (err) {
    console.log(err);
  }
}

userRouter.get('/', async (req, res, next) => {
  try {
    const users = await Users.find({});
    res.send(users);
  } catch (err) {
    next(err);
  }
});

userRouter.delete('/', async (req, res, next) => {
  try {
    await Users.deleteMany({});
    res.send('Deleted all users');
  } catch (err) {
    next(err);
  }
});

userRouter.post('/', async (req, res, next) => {
  const user = req.body;
  const { email } = user;
  console.log(user);
  const domain = email.substring(email.lastIndexOf('@') + 1);
  const newUser = new Users(user);
  try {
    const savedUser = await newUser.save();
    const faction = await Faction.findOneAndUpdate(
      {
        domain
      },
      {
        $push: { members: savedUser._id }
      },
      { upsert: true, new: true }
    );
    res.send({ savedUser, faction });
  } catch (err) {
    if (err.code === 11_000) {
      res.status(409).send('User with email address already exists');
    }

    next(err);
  }
});

userRouter.put('/', async (req, res, next) => {
  const user = req.body;
  console.log('user', user);
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { email: user.email },
      user,
      { new: true }
    );
    console.log('updatedUser', updatedUser);

    res.send({ updatedUser });

    await updateContactOnSave(updatedUser);
  } catch (err) {
    next(err);
  }
});

userRouter.post('/login', async (req, res, next) => {
  const userFromBody = req.body;
  const { email, password } = userFromBody;
  try {
    const matchedUser = await Users.findOne({ email });
    if (matchedUser) {
      const isValidPassword = await matchedUser.comparePassword(password);
      if (isValidPassword) {
        matchedUser.numLogins++;
        matchedUser.lastLoginDate = new Date();

        await matchedUser.save();
        const safeUser = matchedUser.toObject();

        delete safeUser.password;
        res.status(200).send(safeUser);
      } else {
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    next(err);
  }
});

module.exports = userRouter;