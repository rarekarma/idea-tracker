const Users = require('./Users.model.js');
const { fieldMapping } = require('./utils.js');

async function userHandler (message) {
  const event = JSON.parse(message.value);
  const {
    propertyValue,
    propertyName,
    occurredAt,
    objectId,
    changeSource
  } = event;
  if (changeSource === 'API') {
    return;
  }

  try {
    const user = await Users.findOne({ hubspotContactId: objectId });
    if (!user) {
      console.log('Does not exist in database, ignoring');
      return;
    }
    console.log('propertyName', propertyName);
    const fieldToCheck = fieldMapping[propertyName];
    console.log('fieldToCheck', fieldToCheck);

    if (!fieldToCheck) {
      console.log('Not a mapped property');
      return;
    }
    if (user[fieldToCheck] === propertyValue) {
      console.log('field values already match');
      return;
    }
    // check history
    console.log(
      'whenmodifed',
      user.propertyHistory[`${fieldToCheck}History`][0].whenModified
    );
    console.log('occurredAt', occurredAt);
    const lastModifiedFromDB = Date.parse(
      user.propertyHistory[`${fieldToCheck}History`][0].whenModified
    );

    const lastModifiedFromHS = Date.parse(occurredAt);
    if (lastModifiedFromDB >= lastModifiedFromHS) {
      console.log('field value is less current that what is saved');
      return;
    }

    user[fieldToCheck] = propertyValue;
    await user.save();
  } catch (err) {
    console.log(err);
  }

  // If they are different, check to see if this is more recent information, then apply
}

module.exports = userHandler;