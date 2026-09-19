# SupportAI

AI-powered customer support management platform that combines ticket management, role-based access control, semantic search, RAG-based knowledge retrieval, and AI-assisted support workflows.

## Overview

SupportAI is a full-stack customer support platform designed to help support teams manage customer tickets and use AI-assisted workflows to improve support operations.

The platform includes a dedicated backend, frontend, and Python-based AI service.

## Architecture

```text
Next.js + React + TypeScript
            |
         REST API
            |
      NestJS + Prisma
            |
 PostgreSQL + pgvector
            |
     Python FastAPI
            |
   AI + RAG + Embeddings

  ## Key Features
User registration and authentication
JWT-based authentication
Role-based access control
Admin, Agent, and Customer roles
Customer ticket creation and management
Ticket status and priority management
Ownership-based ticket access control
Input validation and error handling
AI ticket classification
Sentiment analysis
Ticket summarization
AI-assisted response generation
Knowledge base management
Semantic search
RAG-based knowledge retrieval
Sentence Transformer embeddings
PostgreSQL with pgvector
Audit logging
Swagger/OpenAPI API documentation
AI & RAG

SupportAI uses a Python FastAPI service for AI-related operations.

The knowledge retrieval workflow uses:

Knowledge documents
Document chunking
Sentence Transformer embeddings
PostgreSQL + pgvector
Semantic similarity search
Relevant knowledge retrieval
Context-aware response generation

The embedding model used for semantic search is:

all-MiniLM-L6-v2

with 384-dimensional embeddings.

## Technology Stack

Frontend
Next.js
React
TypeScript
Tailwind CSS
Backend
NestJS
TypeScript
Prisma
REST APIs
JWT
Swagger/OpenAPI
AI Service
Python
FastAPI
Sentence Transformers
PyTorch
Database
PostgreSQL
pgvector
Development Tools
Git
GitHub
VS Code
Postman / Swagger

## Project Structure

support-ai/
│
├── frontend/
│   └── Next.js frontend
│
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── tickets/
│   │   ├── messages/
│   │   ├── knowledge/
│   │   ├── audit/
│   │   └── prisma/
│   │
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
│
├── ai-service/
│   └── FastAPI AI service
│
├── .gitignore
└── README.md
Running the Project

1. Clone the repository
git clone https://github.com/aathil-yaseen/support-ai.git
cd support-ai

2. Backend
cd backend
npm install

Create a .env file:

DATABASE_URL=
JWT_SECRET=

Run Prisma:

npx prisma generate
npx prisma migrate dev

Start the backend:

npm run start:dev

Backend:

http://localhost:4000

Swagger:

http://localhost:4000/api

3. AI Service
cd ai-service
python -m venv venv

Activate the virtual environment and install dependencies.

Then start FastAPI:

python -m uvicorn main:app --host 127.0.0.1 --port 8000

AI service:

http://localhost:8000

Swagger:

http://localhost:8000/docs
4. Frontend
cd frontend
npm install
npm run dev

Frontend:

http://localhost:3000
Security

Sensitive environment variables and local development files are excluded from version control.

The repository does not contain production credentials or local environment secrets.

Project Status

Core development and functional testing completed.

Current focus:

Documentation
GitHub presentation
Final frontend polish
Deployment preparation

Author
Aathil Yaseen

