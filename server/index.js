const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;
const publicDir = path.join(__dirname, "..", "public");

if (!mongoUri) {
  console.warn(
    "MONGODB_URI is not set. Provide a MongoDB Atlas connection string."
  );
} else {
  mongoose
    .connect(mongoUri)
    .then(() => {
      console.log("Connected to MongoDB Atlas");
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error);
    });
}

app.use(express.json());
app.use(express.static(publicDir));

app.get("/health", (req, res) => {
  const state = mongoose.connection.readyState;
  res.status(200).json({
    status: "ok",
    dbState: state,
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
