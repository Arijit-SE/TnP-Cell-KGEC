global.locationid = 2;
const client = require('pcloud-sdk-js').createClient(process.env.PCLOUD_TOKEN);
module.exports = client;