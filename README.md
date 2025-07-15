# Agency Web App

This repository contains a basic skeleton of a web application with a FastAPI
backend and a React + TypeScript frontend.

## Backend

The backend resides in `agency_backend` and uses FastAPI with SQLAlchemy for
database access. To start it locally install the requirements and run uvicorn:

```bash
pip install -r agency_backend/requirements.txt
uvicorn agency_backend.app.main:app --reload --port 8000
```

A default admin user with login `admin` and password `admin123` is created on
first run.

## Frontend

The frontend is inside `agency_frontend` and was bootstrapped with Vite. After
installing the Node dependencies you can start the dev server:

```bash
cd agency_frontend
npm install
npm run dev
```

The frontend expects the backend on `http://localhost:8000` by default. Copy
`agency_frontend/.env.example` to `.env` if you need to change that URL.

## Environment

Copy `.env.example` in the repository root to `.env` if you need to provide
additional environment variables.
