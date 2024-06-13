import { verify } from "jsonwebtoken";

import * as dotenv from "dotenv";
dotenv.config();

export default function authenticate(req, res, next) {
  const accessToken = req.cookies.access_token;
  if (!accessToken) {
    return res.sendStatus(401);
  }
  try {
    const data = verify(accessToken, process.env.ACCESS_TOKEN);
    req.username = data.username;
    return next();
  } catch {
    return res.sendStatus(401);
  }
}
