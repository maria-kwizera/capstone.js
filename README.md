# Capstone: KGL Procurement API

This is a minimal Node.js HTTP server that manages procurement records for KGL using a local `data.json` file.

## Run locally

1. Open a terminal in the project folder:

```bash
cd "c:/Users/USER/Desktop/capstone.js"
node server.js
```

2. The server listens on port `3000` by default (or `PORT` env).

## API

- GET /kgl/procurement
  - Returns JSON array of records (200 OK). If `data.json` doesn't exist, returns `[]`.

- POST /kgl/procurement
  - Accepts JSON body (e.g. `{ "produceName": "Maize", "tonnage": 10, "cost": 200 }`).
  - Appends the record to `data.json` and returns 201 Created on success.
  - Returns 400 Bad Request for invalid JSON.

## Test with curl

Get records:

```bash
curl -v http://localhost:3000/kgl/procurement
```

Add a record:

```bash
curl -v -X POST http://localhost:3000/kgl/procurement \
  -H "Content-Type: application/json" \
  -d '{"produceName":"Maize","tonnage":10,"cost":200}'
```

## GitHub & Deploy (manual steps)

1. Initialize git, commit, push to a new GitHub repo:

```bash
cd "c:/Users/USER/Desktop/capstone.js"
git init
git add .
git commit -m "Add KGL procurement API"
# Create a repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

2. Deploy to Render.com:
- Create a new Web Service on Render, connect your GitHub repo.
- Set the build/ start command: `node server.js`.
- If using a different start command, set it in Render's settings.
- Render will give you a public URL for the deployed API.

If you'd like, I can help you step-by-step to create the GitHub repo and deploy to Render.
