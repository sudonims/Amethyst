const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
var cors = require("cors");

require("dotenv").config();

const corsOptions = {
  origin: true,
  credentials: true,
  optionSuccessStatus: 200,
};

const app = express();

const index = require("./routes/index.route");
const secured = require("./routes/secured.route");
const { connect } = require("./helpers/mongo");
const NodeRSA = require("node-rsa");
const { rsaDecrypt } = require("./helpers/rsaDecrypt");

const verifyJWT = require("./helpers/jwtSign").verify;

app.use(cors(corsOptions));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(morgan("dev"));
app.use(cookieParser());

connect();

app.use("/", index);
app.use("/secured", verifyJWT, secured);

const port = process.env.PORT || 8080;

app.listen(port, (err) => {
  if (!err) {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  }
});

// const key = new NodeRSA(process.env.RSA_PUBLIC, "openssh-public");

// console.log(key.encrypt('{"a": ""}', "base64"));
