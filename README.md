# URL Shortener

A full-stack URL shortener built with FastAPI, PostgreSQL, React, and Tailwind CSS v4. Enter a long URL to create a compact link, then copy, visit, update, or delete it from the web interface.

## Features

- Create shortened URLs
- View the original URL, shortened URL, and click count
- Copy a shortened URL to the clipboard
- Open shortened URLs in a new tab
- Delete saved URLs
- Responsive Tailwind CSS interface with error and empty states

## Tech Stack

- Backend: FastAPI, SQLAlchemy, Alembic, PostgreSQL
- Frontend: React, Vite, Tailwind CSS v4

## Run the Backend

1. Create a `.env` file in the project root with a PostgreSQL connection string:

   ```env
   DATABASE_URL=postgresql+psycopg://<user>:<password>@localhost:5432/url_shortener
   ```

2. Activate the virtual environment and install dependencies:

   ```powershell
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

3. Apply database migrations and start the API:

   ```powershell
   alembic upgrade head
   uvicorn app.main:app --reload
   ```

The API runs at `http://localhost:8000`. Interactive API documentation is available at `http://localhost:8000/docs`.

## Run the Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL shown by Vite, usually `http://localhost:5173`.

## API Routes

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/urls` | Create a shortened URL |
| `GET` | `/urls` | List all shortened URLs |
| `GET` | `/urls/{short_code}` | Get URL details |
| `PUT` | `/urls/{short_code}` | Update the original URL |
| `DELETE` | `/urls/{short_code}` | Delete a shortened URL |
| `GET` | `/{short_code}` | Redirect to the original URL and record a click |

## Example: Create a Short URL

```bash
curl -X POST "http://localhost:8000/urls" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```
