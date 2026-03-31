# 🌳 The Ancient Tree — AI Mentor

A web application featuring a procedurally-generated 3D tree that acts as an AI mentor. Users share a problem or question, and the tree responds with nature-themed wisdom while physically reacting — changing color and lighting — based on the sentiment of the user's input.

![Demo](demo.gif)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Three Fiber, Three.js, Vite |
| Backend | Python 3.11+, FastAPI, Uvicorn |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| 3D | Procedural tree built with React Three Fiber (no external model required) |

---

## Project Structure

```
ai-mentor-tree/
├── backend/
│   ├── main.py              # FastAPI server + AI logic
│   ├── requirements.txt
│   └── .env.example
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
    ├── vite.config.js
    └── .env.example
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- An [Anthropic API key](https://console.anthropic.com/)

---

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your Anthropic API key:
# ANTHROPIC_API_KEY=sk-ant-...

# Start the server
uvicorn main:app --reload --port 8000
```

The API will be running at **http://localhost:8000**

- `POST /mentor` — Main endpoint (accepts `{ "message": "..." }`, returns advice JSON)
- `GET /health` — Health check
- `GET /docs` — Interactive API docs (Swagger UI)

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Default VITE_API_URL=http://localhost:8000 should work as-is

# Start dev server
npm run dev
```

The app will be running at **http://localhost:5173**

---

## How It Works

### AI Response Format

The backend prompts Claude to return a structured JSON object:

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
4. **HTTP errors** — FastAPI error handler returns structured error messages

### Loading State UX

- The tree auto-rotates faster while "thinking"
- Leaf clusters pulse with an emissive glow
- A cycling nature-themed message ("The roots reach deep…") keeps the user informed
- The button is disabled and input is locked during the API call

---

## Environment Variables

### Backend (`backend/.env`)
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:8000
```

> ⚠️ **Never commit `.env` files.** Both are in `.gitignore`.

---

## Building for Production

```bash
# Frontend
cd frontend && npm run build
# Output in frontend/dist/

# Backend
# Deploy with: uvicorn main:app --host 0.0.0.0 --port 8000
# Recommended: gunicorn with uvicorn workers for production
```

---

## Design Decisions

- **Procedural tree over GLTF model** — Full programmatic control over colors and lighting reactions. No asset loading latency.
- **FastAPI over Flask** — Async support, automatic OpenAPI docs, built-in Pydantic validation.
- **Structured JSON prompting** — System prompt strictly instructs Claude to return only JSON; fallback parsing handles edge cases gracefully.
- **React Three Fiber** — Declarative 3D in React with hooks integration; makes it easy to wire tree state to React state.
