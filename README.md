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
first run. The API requires authentication for most endpoints, so obtain a token
via the `/token` endpoint before requesting protected resources. If you see
`401 Unauthorized` errors in the frontend, make sure you are logged in and the
`Authorization` header is being sent with your requests. Once the server is
running you can explore interactive API docs at `http://localhost:8000/docs`.

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

## Deploying to a test subdomain

If you want to run the application on a remote server under a test subdomain
such as `https://test.example.com`, follow these steps:

1. **Backend**
   - Upload the project sources to the server.
   - Install the backend dependencies:

     ```bash
     pip install -r /path/to/project/agency_backend/requirements.txt
     ```

   - Start the API so it listens on all interfaces:

     ```bash
     uvicorn agency_backend.app.main:app --host 0.0.0.0 --port 8000
     ```

   - Configure your web server (for example Nginx) to proxy requests from
     `https://test.example.com/api/` to `http://127.0.0.1:8000/`.

2. **Frontend**
   - On the server, build the frontend with the API URL pointing to the same
     subdomain:

     ```bash
     cd /path/to/project/agency_frontend
     npm install
     VITE_API_URL=https://test.example.com/api npm run build
     ```

   - Serve the generated `agency_frontend/dist` folder under the subdomain.
     For instance, with Nginx:

     ```nginx
     server {
       server_name test.example.com;

       location / {
         root /path/to/project/agency_frontend/dist;
         try_files $uri /index.html;
       }

       location /api/ {
         proxy_pass http://127.0.0.1:8000/;
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
       }
     }
     ```

Once the reverse proxy is reloaded, open `https://test.example.com` in your
browser to access the application.
