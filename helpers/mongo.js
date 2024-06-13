const { default: mongoose } = require("mongoose");
const { UserPassSchema, NoteSchema } = require("../models/models");

// Replace the uri string with your connection string.
require("dotenv").config();

const mongoUsername = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoCluster = process.env.MONGO_CLUSTER;
const mongoURI = `mongodb+srv://${mongoUsername}:${mongoPassword}@${mongoCluster}`;

const UserPass = mongoose.model("UserPass", UserPassSchema);
const Notes = mongoose.model("Notes", NoteSchema);

module.exports = {
  connect: () => {
    mongoose.connect(mongoURI).then(() => {
      console.log("MONGODB CONNECTED");
    });
  },
  models: {
    UserPass,
    Notes,
  },

  closeConnection: async () => {
    await mongoose.disconnect();
  },
};
