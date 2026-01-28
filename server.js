const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const { url, method } = req;
  const dataPath = path.join(__dirname, "data.json");

  if (url === "/" && method === "GET") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h1>Home route</h1>");
    return;
  }

  // GET /kgl/procurement - return array of records (empty array if file missing)
  if (url === "/kgl/procurement" && method === "GET") {
    fs.readFile(dataPath, "utf8", (err, data) => {
      if (err) {
        if (err.code === "ENOENT") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify([]));
          return;
        }
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to read data" }));
        return;
      }

      try {
        JSON.parse(data);
      } catch (e) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Corrupted data file" }));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(data);
    });
    return;
  }

  // POST /kgl/procurement - accept JSON body, append to data.json
  if (url === "/kgl/procurement" && method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      // Protect against very large bodies
      if (body.length > 1e6) {
        res.writeHead(413, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Payload too large" }));
        req.connection.destroy();
      }
    });

    req.on("end", () => {
      let newRecord;
      try {
        newRecord = JSON.parse(body);
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
        return;
      }

      // Read existing data (if any)
      fs.readFile(dataPath, "utf8", (err, data) => {
        let list = [];
        if (err) {
          if (err.code !== "ENOENT") {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Failed to read data" }));
            return;
          }
          // ENOENT -> treat as empty list
        } else {
          try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) list = parsed;
          } catch (e) {
            // If existing file is invalid, reset to empty list
            list = [];
          }
        }

        list.push(newRecord);

        fs.writeFile(dataPath, JSON.stringify(list, null, 2), "utf8", (err) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Failed to write data" }));
            return;
          }

          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Record added" }));
        });
      });
    });

    req.on("error", () => {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Request error" }));
    });
    return;
  }

  if (url === "/favicon.ico") {
    res.writeHead(204);
    res.end();
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

server.on("error", (err) => {
  console.error("Server error:", err);
});

server.listen(PORT, "0.0.0.0", () => {
  const addr = server.address();
  console.log(`Server listening on ${addr.address}:${addr.port}`);
});
