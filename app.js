import express from "express";
import cors from "cors";
import fs from "fs-extra";

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = "db.json";

app.use(cors());
app.use(express.json());

// Helper to read/write db.json
async function readDB() {
  const data = await fs.readJson(DB_FILE);
  return data.tasks || [];
}

async function writeDB(tasks) {
  await fs.writeJson(DB_FILE, { tasks }, { spaces: 2 });
}

// GET all tasks
app.get("/tasks", async (req, res) => {
  const tasks = await readDB();
  res.json(tasks);
});

// POST new task
app.post("/tasks", async (req, res) => {
  const tasks = await readDB();
  const newTask = { id: Math.random().toString(36).slice(2, 6), ...req.body };
  tasks.push(newTask);
  await writeDB(tasks);
  res.status(201).json(newTask);
});

// PATCH update task
app.patch("/tasks/:id", async (req, res) => {
  const tasks = await readDB();
  const index = tasks.findIndex((t) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Task not found" });
  tasks[index] = { ...tasks[index], ...req.body };
  await writeDB(tasks);
  res.json(tasks[index]);
});

// DELETE task
app.delete("/tasks/:id", async (req, res) => {
  let tasks = await readDB();
  tasks = tasks.filter((t) => t.id !== req.params.id);
  await writeDB(tasks);
  res.json({ message: "Deleted" });
});

// Root route
app.get("/", (req, res) => res.send("✅ Task Backend Running Successfully"));

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
