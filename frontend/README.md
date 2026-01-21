# Frontend Setup Instructions

This project contains the React frontend for the application.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development

To start the development server:

```bash
npm run dev
```

This will run the frontend on `http://localhost:5173`.

## Configuration

The API base URL is configured in `src/api/axios.ts`. Ensure it points to your running Django backend (default: `http://localhost:8080/api/v1/`).

## API Integration

The frontend uses `axios` for API requests. Authentication is handled via JWT tokens (stored in `localStorage`).

### Example Usage

```typescript
import api from './api/axios';

const fetchMovies = async () => {
  try {
    const response = await api.get('films/');
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};
```
