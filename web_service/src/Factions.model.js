const mongoose = require('mongoose');
const User = require('./Users.model.js');

const factionSchema = new mongoose.Schema({
  domain: { type: String, unique: true },
  hubspotCompanyId: { type: String },
  name: { type: String },
  members: [{ type: mongoose.ObjectId, ref: User }]
});

const Faction = mongoose.model('Faction', factionSchema);

module.exports = Faction;