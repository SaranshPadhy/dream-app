# Dream Tracker 💤

A full-stack CRUD dream logging app with a calendar view, emotion tagging, and emotion filtering!

Built with:
- React (frontend)
- FastAPI + SQLite (backend)
- Plain old CSS
- Dockerized backend for easy deployment!

---

To start the app:

### 1. Clone this repo:

```bash
git clone https://github.com/SaranshPadhy/dream-app.git
cd dream-app
```

### 2. Install Docker

### 3. Build and run backend:

```bash
docker build -t dream-api .

docker run -d -p 8000:8000 \
  -v ./dream.db:/app/dream.db \
  --name dream-api-container dream-api
```

(API is now running at: http://localhost:8000  

Test a route like: http://localhost:8000/dreams?year=2025&month=7)

### 4. Run the frontend:

```bash
cd dream-app
npm install
npm run dev
```

(Frontend is on: http://localhost:3000)

**Features**:

- CRUD app for tracking dreams
- Add, edit, delete dreams
- Filter dreams by emotion directly on the calendar
- Looks like Google calendar! (something about no copyright intended)
- SQLite DB stored locally as dream.db and initializes on first run!

**Dev Notes**:

- Uses Python, FastAPI, React, HTML/CSS for styling and website building!
- Right now not deployed - but will deploy on the portfolio website (coming soon!)
