const { default: mongoose } = require("mongoose");

module.exports = {
  UserPassSchema: new mongoose.Schema({
    username: { type: String },
    password: { type: String },
  }),

  NoteSchema: new mongoose.Schema({
    username: { type: String },
    title: { type: String },
    note: { type: String },
  }),
};
