const router = require("express").Router();
const {
  vote,
  getSingleNote,
  getAllNotes,
  addNote,
  deleteNote,
} = require("../controllers/secured.controller");
const { get, post } = require("../helpers/decryptionVerification");

// router.post("/vote", decryptionVerification, vote);

router.get("/notes/:id", get, getSingleNote);
router.get("/notes", get, getAllNotes);
router.post("/notes", post, addNote);
router.delete("/notes", post, deleteNote);

module.exports = router;
