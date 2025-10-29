import express from "express";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

const DB_FILE = "db.json";

// 🧠 Helper: read/write JSON file
function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ✅ GET all tasks
app.get("/tasks", (req, res) => {
  const data = readDB();
  res.json(data);
});

// ✅ POST new task
app.post("/tasks", (req, res) => {
  const data = readDB();
  const newTask = { id: Date.now(), ...req.body };
  data.push(newTask);
  writeDB(data);
  res.status(201).json(newTask);
});

// ✅ PATCH (update) a task
app.patch("/tasks/:id", (req, res) => {
  const data = readDB();
  const id = parseInt(req.params.id);
  const index = data.findIndex((t) => t.id === id);
  if (index === -1) return res.status(404).json({ message: "Task not found" });
  data[index] = { ...data[index], ...req.body };
  writeDB(data);
  res.json(data[index]);
});

// ✅ DELETE a task
app.delete("/tasks/:id", (req, res) => {
  const data = readDB();
  const id = parseInt(req.params.id);
  const filtered = data.filter((t) => t.id !== id);
  writeDB(filtered);
  res.json({ message: "Task deleted" });
});

// ✅ Root route
app.get("/", (req, res) => {
  res.send("Backend running successfully 🚀");
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
