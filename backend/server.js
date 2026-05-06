const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT;
const mongoDb = process.env.MONGO_DB;
const mongoUsername = process.env.MONGO_USERNAME;
const mongoPassword = process.env.MONGO_PASSWORD;

const mongoUrl = `mongodb://${mongoUsername}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDb}?authSource=admin`;

mongoose.connect(mongoUrl)
  .then(() => console.log("Backend connected to secured MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

const noteSchema = new mongoose.Schema({
  title: String,
  text: String,
  user: String
});

const Note = mongoose.model("Note", noteSchema);

app.get("/notes", async (req, res) => {
  const user = req.query.user;

  if (!user) {
    return res.status(400).json({ message: "User required" });
  }

  const notes = await Note.find({ user });
  res.json(notes);
});

app.post("/notes", async (req, res) => {
  const { title, text, user } = req.body;

  if (!title || !text || !user) {
    return res.status(400).json({ message: "Title, text and user required" });
  }

  const note = await Note.create({ title, text, user });

  res.json({
    message: "Note added",
    note
  });
});

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

module.exports = app;
