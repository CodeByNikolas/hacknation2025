# HackNation 2025 Backend

FastAPI backend for HackNation 2025 project.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

Start the development server:
```bash
uvicorn main:app --reload
```

The API will be available at:
- API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Alternative API Docs: http://localhost:8000/redoc

## Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
├── app/
│   ├── __init__.py
│   ├── core/              # Core configuration
│   │   ├── config.py      # Application settings
│   │   └── security.py    # Security utilities (JWT, password hashing)
│   ├── database/          # Database configuration
│   │   ├── base.py        # Database engine and session
│   │   └── models.py      # SQLAlchemy models
│   ├── schemas/           # Pydantic schemas (request/response models)
│   │   └── example.py     # Example schemas
│   ├── services/          # Business logic layer
│   │   └── example_service.py  # Example service
│   ├── routers/           # API route handlers
│   │   ├── __init__.py    # Router aggregation
│   │   └── example.py     # Example router
│   ├── api/               # API dependencies and middleware
│   │   └── dependencies.py # Common dependencies (DB, auth, etc.)
│   └── utils/             # Utility functions
│       └── helpers.py     # Helper functions
```

## Architecture

The backend follows a layered architecture:

- **Routers** (`app/routers/`) - Handle HTTP requests and responses
- **Services** (`app/services/`) - Contain business logic
- **Schemas** (`app/schemas/`) - Define request/response models using Pydantic
- **Database** (`app/database/`) - Database models and connection management
- **Core** (`app/core/`) - Configuration and security utilities
- **API** (`app/api/`) - Shared dependencies and middleware
- **Utils** (`app/utils/`) - Reusable utility functions

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /api/example/` - Get all examples (with pagination)
- `GET /api/example/{example_id}` - Get specific example
- `POST /api/example/` - Create new example
- `PUT /api/example/{example_id}` - Update example
- `DELETE /api/example/{example_id}` - Delete example

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
DATABASE_URL=sqlite:///./app.db
SECRET_KEY=your-secret-key-change-this-in-production
BACKEND_CORS_ORIGINS=http://localhost:3000
```

See `.env.example` for all available configuration options.

## Development

### Adding a New Feature

1. **Create Database Model** (`app/database/models.py`)
   - Define your SQLAlchemy model

2. **Create Schemas** (`app/schemas/`)
   - Create `Base`, `Create`, `Update`, and `Response` schemas

3. **Create Service** (`app/services/`)
   - Implement business logic methods

4. **Create Router** (`app/routers/`)
   - Define API endpoints using the service

5. **Register Router** (`app/routers/__init__.py`)
   - Include your router in the API router

### Database Migrations

For production, consider using Alembic for database migrations:

```bash
pip install alembic
alembic init alembic
```

## Testing

The database is automatically initialized on startup. For development, SQLite is used by default. For production, update `DATABASE_URL` in your `.env` file to use PostgreSQL or MySQL.

