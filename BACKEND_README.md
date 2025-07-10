# Offer Manager Backend

## Setup

1. Install dependencies:

   ```sh
   npm install express cors sqlite3 sqlite express-session multer
   npm install --save-dev @types/express @types/cors @types/express-session @types/multer
   ```

2. Run the backend:

   ```sh
   npx ts-node backend.ts
   ```

- The backend runs on port 4000.
- Default user: `admin` / `admin`
- Uploaded files are stored in the `uploads/` folder.
- SQLite DB file: `offer-manager.db`

## API Endpoints

- `POST /api/login` — { username, password }
- `POST /api/logout`
- `GET /api/me`
- `GET /api/requests`, `POST /api/requests`
- `GET /api/offers`, `POST /api/offers`
- `POST /api/files` (multipart/form-data, field: `file`)
- `GET /api/files/:filename`
