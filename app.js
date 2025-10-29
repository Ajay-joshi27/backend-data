import http from "http";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "db.json");

const readDB = () => JSON.parse(fs.readFileSync(dbPath, "utf-8"));
const writeDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.url === "/tasks" && req.method === "GET") {
    const data = readDB();
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(data.tasks));
  }

  if (req.url === "/tasks" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const data = readDB();
      const newTask = JSON.parse(body);
      newTask.id = Date.now();
      data.tasks.push(newTask);
      writeDB(data);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newTask));
    });
  }

  if (req.url.startsWith("/tasks/") && req.method === "PATCH") {
    const id = parseInt(req.url.split("/")[2]);
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const updates = JSON.parse(body);
      const data = readDB();
      const task = data.tasks.find((t) => t.id === id);
      if (task) {
        Object.assign(task, updates);
        writeDB(data);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(task));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: "Task not found" }));
      }
    });
  }

  if (req.url === "/clear-done" && req.method === "DELETE") {
    const data = readDB();
    data.tasks = data.tasks.filter((task) => task.status !== "Done");
    writeDB(data);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "All Done tasks deleted" }));
  }

  else {
    res.writeHead(404);
    res.end(JSON.stringify({ message: "Not Found" }));
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
