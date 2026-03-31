import os
import json
import re
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq

# Load .env file explicitly
load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

app = FastAPI(title="AI Mentor Tree API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """You are an ancient, wise tree — a living mentor who has stood for centuries and witnessed all of human experience. 
When someone shares a problem or question, you respond with deep, nature-infused wisdom.

You MUST respond ONLY with a valid JSON object — no preamble, no markdown, no explanation outside the JSON.

The JSON must have exactly these keys:
{
  "advice": "Your nature-themed wisdom as a string (2-4 sentences, warm and grounded)",
  "sentiment": "positive" | "neutral" | "negative",
  "tree_reaction": "#RRGGBB"
}

Rules for tree_reaction hex color based on sentiment of the user's problem:
- Positive/hopeful/excited problems → warm golden or bright greens (e.g. #FFD700, #7CFC00, #ADFF2F)
- Neutral/curious/thoughtful problems → calm teals or soft blues (e.g. #00CED1, #4682B4, #48D1CC)
- Negative/anxious/sad/stressed problems → deep purples or muted amber (e.g. #8B4B8B, #D4A017, #9370DB)

Always be kind, poetic, and grounding. Speak as an ancient tree would — with patience and rootedness."""


class MentorRequest(BaseModel):
    message: str


class MentorResponse(BaseModel):
    advice: str
    sentiment: str
    tree_reaction: str


def extract_json(text: str) -> dict:
    """Safely extract JSON from LLM response, handling edge cases."""
    text = text.strip()

    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try extracting JSON block from markdown fences
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # Try finding raw JSON object
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not extract valid JSON from response: {text[:200]}")


def validate_response(data: dict) -> MentorResponse:
    """Validate and sanitize the LLM response."""
    advice = str(data.get("advice", "The forest speaks in whispers. Be still and listen."))

    sentiment = data.get("sentiment", "neutral")
    if sentiment not in ("positive", "neutral", "negative"):
        sentiment = "neutral"

    tree_reaction = data.get("tree_reaction", "#48D1CC")
    if not re.match(r"^#[0-9A-Fa-f]{6}$", str(tree_reaction)):
        tree_reaction = "#48D1CC"

    return MentorResponse(advice=advice, sentiment=sentiment, tree_reaction=tree_reaction)


@app.post("/mentor", response_model=MentorResponse)
async def get_mentor_advice(request: MentorRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if len(request.message) > 1000:
        raise HTTPException(status_code=400, detail="Message too long (max 1000 characters)")

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": request.message}
            ],
            max_tokens=512,
            temperature=0.7,
        )

        raw_text = completion.choices[0].message.content
        parsed = extract_json(raw_text)
        return validate_response(parsed)

    except ValueError as e:
        return MentorResponse(
            advice="The ancient tree rustles its leaves thoughtfully. Even the mightiest oak began as a small seed — trust the process.",
            sentiment="neutral",
            tree_reaction="#48D1CC",
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "AI Mentor Tree"}
