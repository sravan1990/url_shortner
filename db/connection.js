const monk = require('monk');
const connectionURL = process.env.MONGODB_URI || "localhost:27017/test";
const db = monk(connectionURL);

module.exports = db;
