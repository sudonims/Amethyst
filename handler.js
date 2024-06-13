import { Request, Response } from "express";
import { UserPassSchema, NoteSchema } from "../models/Models";
import { sign } from "jsonwebtoken";
import mongoose from "mongoose";

import * as dotenv from "dotenv";
dotenv.config();

const mongoUsername = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoCluster = process.env.MONGO_CLUSTER;
const mongoURI = `mongodb+srv://${mongoUsername}:${mongoPassword}@${mongoCluster}`;
const ACCESS_TOKEN_NAME = "access_token";

mongoose.connect(mongoURI);

export const checkUser = (req: Request, res: Response) => {
  return res.status(200).json({ data: `Success and user is ${req.username}` });
};

export const handleSignup = async (req: Request, res: Response) => {
  const username: string = req.body.username;
  const password: string = req.body.password;
  console.log(`[POST /signup]`);
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
};

export const handleLogin = async (req: Request, res: Response) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password cannot be empty" });
  }
  console.log(`[POST /login]`);
  console.log(`Username Received: ${username}`);
  const checker = await UserPass.find({
    username: username,
    password: password,
  }).exec();
  if (checker.length === 0) {
    console.error(`Invalid Credentials for Username: ${username}`);
    return res.status(400).json({ message: "Invalid Credentials" });
  } else {
    const AccessToken = sign({ username: username }, process.env.ACCESS_TOKEN, {
      expiresIn: "60m",
    });
    console.log(`Login successful for user ${username}`);
    res
      .cookie(ACCESS_TOKEN_NAME, AccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 1000, //60 minutes
      })
      .sendStatus(200);
  }
};

export const getAllNotes = async (req: Request, res: Response) => {
  const username = req.username; //coming straight from authenticate function
  console.log(`[GET /notes]`);
  console.log(`Fetching all notes for username: ${username}`);
  const notes = await Notes.find({ username: username }, null, {
    sort: { _id: "desc" },
  }).exec();
  return res.status(200).json(notes);
};

export const addNote = async (req: Request, res: Response) => {
  const title = req.body.title;
  const note = req.body.note;
  console.log(`[POST /notes] \nTitle: ${title}\nnote: ${note}`);
  if (!title) {
    return res.status(400).json({ message: "Title cannot be empty" });
  }
  await Notes.create({
    username: req.username,
    title: req.body.title,
    note: req.body.note,
  });
  return res.status(200).json({ data: "Note added succesfully" });
};

export const deleteNote = async (req: Request, res: Response) => {
  const id = req.params.id;
  console.log(`[DELETE /notes/${id}]`);
  let delNote = undefined;
  try {
    delNote = await Notes.findById(id).exec();
  } catch (e) {
    console.error(`Could not find note with ID: ${id} for deletion`);
  }

  if (!delNote) {
    return res.status(400).json({ message: "Invalid Request" });
  }

  await Notes.findOneAndDelete({ username: req.username, _id: req.params.id });
  return res.status(204).json({ data: "Note deleted successfully" });
};

export const getSingleNote = async (req: Request, res: Response) => {
  const id = req.params.id;
  console.log(`[GET /notes/${id}]`);
  let note = undefined;
  try {
    note = await Notes.findById(id).exec();
  } catch (e) {
    console.error("Error fetching record from DB with ID: " + id);
    return res.status(500).json({ message: "Error Fetching Record from DB" });
  }
  return res.status(200).json(note);
};

export const logoutUser = async (_: Request, res: Response) => {
  console.log(`[GET /logout]`);
  return res
    .clearCookie(ACCESS_TOKEN_NAME)
    .status(200)
    .json({ message: "Successfully Logged out!" });
};
