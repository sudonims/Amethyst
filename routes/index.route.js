const router = require("express").Router();
const {
  verifyAadhar,
  checkUser,
  handleSignup,
  handleLogin,
  logoutUser,
} = require("../controllers/index.controller");

router.get("/", (req, res) => {
  res.send("Index Route");
});

router.post("/verifyaadhar", verifyAadhar);

// router.get("/user", checkUser);
router.post("/signup", handleSignup);
router.post("/login", handleLogin);
router.get("/logout", logoutUser);

module.exports = router;
