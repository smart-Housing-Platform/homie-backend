# Homie Backend API

This is the backend API for the Homie property rental platform. It provides endpoints for user authentication, property management, rental applications, and maintenance requests.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd homie-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri_here
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get user profile (requires authentication)

### Properties
- GET `/api/properties` - Get all properties (with filters)
- GET `/api/properties/:id` - Get a single property
- POST `/api/properties` - Create a property (landlord only)
- PUT `/api/properties/:id` - Update a property (landlord only)
- DELETE `/api/properties/:id` - Delete a property (landlord only)

### Applications
- POST `/api/applications` - Submit a rental application (tenant only)
- GET `/api/applications/tenant` - Get tenant's applications (tenant only)
- GET `/api/applications/landlord` - Get applications for landlord's properties (landlord only)
- PUT `/api/applications/:id/status` - Update application status (landlord only)

### Maintenance
- POST `/api/maintenance` - Create a maintenance request (tenant only)
- GET `/api/maintenance/tenant` - Get tenant's maintenance requests (tenant only)
- GET `/api/maintenance/landlord` - Get maintenance requests for landlord's properties (landlord only)
- PUT `/api/maintenance/:id/status` - Update maintenance request status (landlord only)

## Development

### Available Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build for production
- `npm start` - Start production server

### Project Structure

```
src/
  ├── config/         # Configuration files
  ├── controllers/    # Route controllers
  ├── middleware/     # Custom middleware
  ├── models/         # Mongoose models
  ├── routes/         # API routes
  ├── types/          # TypeScript type definitions
  ├── utils/          # Utility functions
  └── index.ts        # Application entry point
```

## Error Handling

The API uses a centralized error handling mechanism. All errors are processed by the error handler middleware which sends appropriate error responses. 