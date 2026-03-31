# 🌳 The Ancient Tree — AI Mentor

A full-stack web application featuring a procedurally-generated 3D tree that acts as an AI mentor. Users share a problem or question, and the tree responds with nature-themed wisdom while physically reacting — changing color and lighting — based on the sentiment of the user's input.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Three Fiber, Three.js, Vite |
| Backend | Python 3.11+, FastAPI, Uvicorn |
| AI | Groq API (LLaMA 3.3 70B) |
| 3D | Procedural tree built with React Three Fiber (no external model required) |

---

## Project Structure

```
ai-mentor-tree/
├── backend/
│   └── main.py              # FastAPI server + AI logic
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── TreeCanvas.jsx   # 3D tree scene (R3F)
    │   ├── hooks/
    │   │   └── useMentor.js     # API call hook
    │   ├── App.jsx              # Main UI
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- A free [Groq API key](https://console.groq.com) (no credit card required)

---

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn groq python-dotenv

# Create .env file and add your Groq API key
# Create a file called .env inside the backend folder with this content:
# GROQ_API_KEY=gsk_your-key-here

# Start the server
venv\Scripts\python.exe -m uvicorn main:app --port 8000
```

The API will be running at **http://localhost:8000**

- `POST /mentor` — Main endpoint (accepts `{ "message": "..." }`, returns advice JSON)
- `GET /docs` — Interactive API docs (Swagger UI)

> **Windows tip:** If the above doesn't work, set the key directly in PowerShell:
> ```
> $env:GROQ_API_KEY="gsk_your-key-here"; venv\Scripts\python.exe -m uvicorn main:app --port 8000
> ```

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Install 3D libraries
npm install three @react-three/fiber @react-three/drei

# Start dev server
npm run dev
```

The app will be running at **http://localhost:5173**

> **Note:** The frontend calls `http://localhost:8000` by default. Make sure the backend is running before using the app.

---

## How It Works

### AI Response Format

The backend prompts the LLM to return a structured JSON object:

```json
{
  "advice": "Nature-themed wisdom as a warm, grounded string",
  "sentiment": "positive | neutral | negative",
  "tree_reaction": "#RRGGBB"
}
```

### Sentiment → Tree Color Mapping

| Sentiment | Color Range | Example |
|-----------|-------------|---------|
| Positive / hopeful | Warm golds, bright greens | `#FFD700`, `#7CFC00` |
| Neutral / curious | Calm teals, soft blues | `#48D1CC`, `#4682B4` |
| Negative / anxious | Deep purples, muted ambers | `#9370DB`, `#D4A017` |

### Error Handling (AI Reliability)

The backend handles LLM instability at multiple levels:

1. **JSON extraction** — Tries direct parse → markdown fence extraction → raw regex match
2. **Field validation** — Validates `sentiment` enum and `tree_reaction` hex format
3. **Safe fallback** — If all parsing fails, returns a sensible default response instead of crashing
4. **HTTP errors** — FastAPI returns structured error messages

### Loading State UX

- The tree auto-rotates faster while "thinking"
- Leaf clusters pulse with an emissive glow
- A cycling nature-themed message ("The roots reach deep…") keeps the user informed
- The button is disabled and input is locked during the API call

---

## Environment Variables

### Backend (`backend/.env`)
```
GROQ_API_KEY=gsk_your-key-here
```

> ⚠️ **Never commit `.env` files.** It is listed in `.gitignore`.

---

## Design Decisions

- **Procedural tree over GLTF model** — Full programmatic control over colors and lighting reactions. No asset loading latency.
- **FastAPI over Flask** — Async support, automatic OpenAPI docs, built-in Pydantic validation.
- **Groq (LLaMA 3.3 70B)** — Free tier, extremely fast inference, no credit card required.
- **Structured JSON prompting** — System prompt strictly instructs the LLM to return only JSON; fallback parsing handles edge cases gracefully.
- **React Three Fiber** — Declarative 3D in React with hooks integration; makes it easy to wire tree state to React state.
