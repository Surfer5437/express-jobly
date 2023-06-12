"use strict";
/** Database setup for jobly. */
const { Client } = require("pg");

const db = new Client({
  host:'localhost',
  user:'livin',
  port:'5432',
  password:'rootUser',
  database:'jobly'
});

db.connect();

module.exports = db;