const jwtSign = require("../helpers/jwtSign").sign;
const genLucky = require("../helpers/luckyNumGen");
const pow = require("../helpers/modularExp");
const { UserPass } = require("../helpers/mongo").models;
const ACCESS_TOKEN_NAME = "access_token";

module.exports = {
  verifyAadhar: (req, res) => {
    try {
      const { uid, bday } = req.body;
      console.log(uid, bday);

      /**
       * Lucky Number or secret key for server
       * 6 digit in length
       * used on deffie hellman shared key generation
       */
      const lucky = genLucky(req.body);
      console.log("lucky", lucky);
      /**
       * Token generated from server for authorization in requests
       */

      const tkn = jwtSign({
        uid,
        bday,
        num: Math.random().toFixed(2),
      });

      /**
       * Diffie hellman public key for server generation
       */
      var serverPub = pow(17, lucky, 541);

      res.status(200).send({
        serverPub,
        token: tkn,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.log(err);
      res.status(503).send("error");
    }
    // axios
    //   .post(
    //     `http://www.uidai.gov.in/authentication/uid-auth-request/2.0/public/${uid[0]}/${uid[1]}/MMxNu7a6589B5x5RahDW-zNP7rhGbZb5HsTRwbi-VVNxkoFmkHGmYKM`,
    //     xml,
    //     {
    //       headers: {
    //         "Content-Type": "text/xml",
    //       },
    //     }
    //   )
    //   .then((res_) => {
    //     res.send(res_.data);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  },

  // checkUser: async (req, res) => {
  //   return res
  //     .status(200)
  //     .json({ data: `Success and user is ${req.username}` });
  // },

  handleSignup: async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log(`Username Received: ${username}`);
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password cannot be empty" });
    }
    const checker = await UserPass.find({
      username: username,
    }).exec();
    if (checker.length !== 0) {
      console.error(`${username} already exists in database`);
      return res.status(400).json({ message: "User already exists" });
    } else {
      await UserPass.create({ username: username, password: password });
      console.log(`Registered user ${username}`);
      res.status(200).json({ data: `${username} registered successfully` });
    }
  },

  handleLogin: async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password cannot be empty" });
    }
    console.log(`Username Received: ${username}`);
    const checker = await UserPass.find({
      username: username,
      password: password,
    }).exec();
    if (checker.length === 0) {
      console.error(`Invalid Credentials for Username: ${username}`);
      return res.status(400).json({ message: "Invalid Credentials" });
    } else {
      /**
       * Lucky Number or secret key for server
       * 6 digit in length
       * used on deffie hellman shared key generation
       */
      const lucky = genLucky(req.body);

      /**
       * Token generated from server for authorization in requests
       */
      const tkn = jwtSign({
        username,
        password,
        num: Math.random().toFixed(2),
      });

      /**
       * Diffie hellman public key for server generation
       */
      var serverPub = pow(17, lucky, 541);

      res.status(200).json({
        serverPub,
        token: tkn,
      });
    }
  },

  logoutUser: async (req, res) => {
    return res
      .clearCookie(ACCESS_TOKEN_NAME)
      .status(200)
      .json({ message: "Successfully Logged out!" });
  },
};
