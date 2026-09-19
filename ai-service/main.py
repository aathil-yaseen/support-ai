from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI(
    title="SupportAI AI Service",
    description="AI service for the SupportAI platform",
    version="1.0.0",
)


class TicketRequest(BaseModel):
    title: str
    description: str
    context: str = ""


class EmbeddingRequest(BaseModel):
    text: str


# Embedding model
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")


@app.get("/")
def root():
    return {
        "message": "SupportAI AI Service is running!"
    }


@app.post("/ai/respond")
def generate_response(ticket: TicketRequest):

    context = ticket.context.strip()

    # RAG context available
    if context:

        response = (
            "Thank you for contacting support. "
            "Based on our support documentation, "
            f"{context} "
            "Please follow the recommended steps and "
            "contact support again if the issue continues."
        )

    # No RAG context
    else:

        text = f"{ticket.title} {ticket.description}".lower()

        if "password" in text or "login" in text or "sign in" in text:

            response = (
                "Thank you for contacting support. "
                "Since you are unable to log in even with the correct password, "
                "please verify your account email and try resetting your password. "
                "If the issue continues, please contact technical support."
            )

        elif "payment" in text or "refund" in text:

            response = (
                "Thank you for contacting support. "
                "We will review your payment issue and assist you with "
                "the refund or billing process."
            )

        else:

            response = (
                "Thank you for contacting support. "
                "We have received your request and our support team "
                "will review the issue and get back to you."
            )

    return {
        "response": response,
        "confidence": 0.85
    }


@app.post("/ai/classify")
def classify_ticket(ticket: TicketRequest):

    text = f"{ticket.title} {ticket.description}".lower()

    if any(
        word in text
        for word in ["payment", "refund", "charged", "money"]
    ):
        category = "BILLING"

    elif any(
        word in text
        for word in ["login", "password", "account", "sign in"]
    ):
        category = "ACCOUNT"

    elif any(
        word in text
        for word in ["error", "bug", "crash", "not working"]
    ):
        category = "TECHNICAL"

    else:
        category = "GENERAL"

    return {
        "category": category,
        "confidence": 0.90
    }


@app.post("/ai/sentiment")
def analyze_sentiment(ticket: TicketRequest):

    text = f"{ticket.title} {ticket.description}".lower()

    negative_words = [
        "angry",
        "frustrated",
        "bad",
        "terrible",
        "hate",
        "problem",
        "cannot",
        "unable",
        "error",
        "not working",
    ]

    positive_words = [
        "thank",
        "thanks",
        "good",
        "great",
        "excellent",
        "happy",
    ]

    negative_score = sum(
        word in text for word in negative_words
    )

    positive_score = sum(
        word in text for word in positive_words
    )

    if negative_score > positive_score:
        sentiment = "NEGATIVE"

    elif positive_score > negative_score:
        sentiment = "POSITIVE"

    else:
        sentiment = "NEUTRAL"

    return {
        "sentiment": sentiment,
        "confidence": 0.85
    }


@app.post("/ai/summarize")
def summarize_ticket(ticket: TicketRequest):

    summary = (
        f"Customer reported an issue: {ticket.title}. "
        f"Main details: {ticket.description}"
    )

    return {
        "summary": summary
    }


@app.post("/ai/embed")
def generate_embedding(request: EmbeddingRequest):

    embedding = embedding_model.encode(
        request.text
    ).tolist()

    return {
        "dimension": len(embedding),
        "embedding": embedding
    }