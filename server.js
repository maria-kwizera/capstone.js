const http = require("http");
const fs = require("fs");
const path = require("path");
const { getProcurements, addProcurement } = require('./app');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const { url, method } = req;
  
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  // Handle preflight requests
  if (method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const dataPath = path.join(__dirname, "data.json");

  // Handle root path - serve index.html
  if ((url === "/" || url === "/index.html") && method === "GET") {
    const indexPath = path.join(__dirname, "views", "index.html");
    fs.readFile(indexPath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error loading page");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
    return;
  }

  // Serve static files (CSS, JS, images)
  if (method === "GET" && (url.startsWith("/style/") || url.startsWith("/js/") || url.startsWith("/images/"))) {
    const filePath = path.join(__dirname, url);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("File not found");
        return;
      }

      let contentType = "text/plain";
      if (url.endsWith(".css")) contentType = "text/css";
      else if (url.endsWith(".js")) contentType = "application/javascript";
      else if (url.endsWith(".png")) contentType = "image/png";
      else if (url.endsWith(".jpg") || url.endsWith(".jpeg")) contentType = "image/jpeg";
      else if (url.endsWith(".gif")) contentType = "image/gif";

      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    });
    return;
  }

  // GET /kgl/procurement - return array of records (empty array if file missing)
  if (url === "/kgl/procurement" && method === "GET") {
    getProcurements()
      .then((list) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(list));
      })
      .catch((err) => {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to read data" }));
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

      addProcurement(newRecord)
        .then(() => {
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Record added" }));
        })
        .catch(() => {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Failed to write data" }));
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
