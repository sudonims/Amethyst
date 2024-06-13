const crypto = require("crypto-js");
const { Notes } = require("../helpers/mongo").models;

module.exports = {
  // vote: async (req, res) => {
  //   try {
  //     const { data, timestamp } = req.body;
  //     console.log(req.body);

  //     /**
  //      * Vote is added to the block.
  //      */

  //     const res_ = await client.query(
  //       "INSERT INTO VOTED(UID, VOTE) VALUES($1, $2)",
  //       [req.authorizedUser.uid, "1"]
  //     );

  //     res.status(200).send("success");
  //   } catch (err) {
  //     console.log(err);
  //     res.status(503).send("Error");
  //   }
  // },

  getAllNotes: async (req, res) => {
    // const username = req.username; //coming straight from authenticate function
    const { username, secretAES } = req.authorizedUser;
    console.log(`Fetching all notes for username: ${username} ${secretAES}`);
    const notes = await Notes.find({ username: username }, null, {
      sort: { _id: "desc" },
    }).exec();
    return res.status(200).json({
      data: crypto.AES.encrypt(JSON.stringify(notes), secretAES).toString(),
    });
  },

  addNote: async (req, res) => {
    console.log("skjodjd", req.body);
    const title = req.body.title;
    const note = req.body.note;
    const { username, secretAES } = req.authorizedUser;

    if (!title) {
      return res.status(400).json({
        data: crypto.AES.encrypt("Title can't be empty", secretAES).toString(),
      });
    }
    await Notes.create({
      username: username,
      title: title,
      note: note,
    });
    return res
      .status(200)
      .json({ data: crypto.AES.encrypt("Note Added", secretAES).toString() });
  },

  deleteNote: async (req, res) => {
    const { id } = req.body;
    const { username, secretAES } = req.authorizedUser;
    let delNote = undefined;
    try {
      delNote = await Notes.findById(id).exec();
    } catch (e) {
      console.error(`Could not find note with ID: ${id} for deletion`);
    }

    if (!delNote) {
      return res.status(400).json({
        data: crypto.AES.encrypt("Invalid Request", secretAES).toString(),
      });
    }

    await Notes.findOneAndDelete({
      username: username,
      _id: id,
    });
    return res.status(204).json({
      data: crypto.AES.encrypt(
        "Note deleted successfully",
        secretAES
      ).toString(),
    });
  },

  getSingleNote: async (req, res) => {
    const id = req.params.id;
    const { secretAES } = req.authorizedUser;

    let note = undefined;
    try {
      note = await Notes.findById(id).exec();
    } catch (e) {
      console.error("Error fetching record from DB with ID: " + id);
      return res.status(500).json({
        data: crypto.AES.encrypt(
          "Error Fetching Record from DB",
          secretAES
        ).toString(),
      });
    }
    return res.status(200).json({
      data: crypto.AES.encrypt(JSON.stringify(note), secretAES).toString(),
    });
  },
};
