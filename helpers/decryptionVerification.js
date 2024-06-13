const crypto = require("crypto-js");
const generatePass = require("pr-pass");
const luckyGen = require("../helpers/luckyNumGen");
const pow = require("../helpers/modularExp");
const generateHmac = require("../helpers/generateHmac");

module.exports = {
  post: (req, res, next) => {
    try {
      const { username, password } = req.authorizedUser;

      /**
       * Diffie Hellman, ( g = 17 ,p = 541)
       * get public from client
       * Generate private server again
       * calculate shared private
       */

      console.log(req.authorizedUser);

      const clientPublic = parseInt(req.headers.publickey);

      const serverPrivate = luckyGen({
        username,
        password,
      });

      const sharedKey = pow(clientPublic, serverPrivate, 541);
      console.log(sharedKey);
      /**
       * Generate Symmetric Key with PR Pass
       * You have lucky number as sharedKey from Diffie Hellman
       */

      const secretAES = generatePass(req.headers.authorization, sharedKey);
      console.log(secretAES);

      /**
       * Decrypt with the symmetric key generated from PR Pass.
       */

      console.log(req);
      console.log(req.body);

      const payload = req.body.payload.split("|");
      console.log(payload);

      var cipher = crypto.AES.decrypt(payload[0], secretAES).toString(
        crypto.enc.Utf8
      );
      cipher = JSON.parse(cipher);
      console.log(cipher);

      const hmac = generateHmac(cipher, secretAES);
      if (hmac === payload[1]) {
        req.body = cipher;
        /**
         * request body is converted back to the original plaintext
         * JSON fomrat that was sent by the voter
         */

        req.authorizedUser = {
          ...req.authorizedUser,
          secretAES,
        };
        next();
      } else {
        throw new Error("hmacFailed");
      }
    } catch (err) {
      console.log(err);
      res.status(503).send("Error Occured");
    }
  },

  get: async (req, res, next) => {
    try {
      const { username, password } = req.authorizedUser;

      /**
       * Diffie Hellman, ( g = 17 ,p = 541)
       * get public from client
       * Generate private server again
       * calculate shared private
       */

      console.log(req.authorizedUser);

      const clientPublic = parseInt(req.headers.publickey);

      const serverPrivate = luckyGen({
        username,
        password,
      });

      const sharedKey = pow(clientPublic, serverPrivate, 541);
      console.log(sharedKey);
      /**
       * Generate Symmetric Key with PR Pass
       * You have lucky number as sharedKey from Diffie Hellman
       */

      const secretAES = generatePass(req.headers.authorization, sharedKey);
      console.log(secretAES);

      /**
       * Decrypt with the symmetric key generated from PR Pass.
       */

      // const payload = req.body.payload.split("|");
      // console.log(payload);

      // var cipher = crypto.AES.decrypt(payload[0], secretAES).toString(
      //   crypto.enc.Utf8
      // );
      // cipher = JSON.parse(cipher);
      // console.log(cipher);

      req.authorizedUser = {
        ...req.authorizedUser,
        secretAES,
      };
      // const hmac = generateHmac(cipher, secretAES);
      // if (hmac === payload[1]) {
      //   req.body = cipher;
      //   /**
      //    * request body is converted back to the original plaintext
      //    * JSON fomrat that was sent by the voter
      //    */

      next();
      // } else {
      //   throw new Error("hmacFailed");
      // }
    } catch (err) {
      console.log(err);
      res.status(503).send("Error Occured");
    }
  },
};
