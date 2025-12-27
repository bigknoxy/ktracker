# kTracker API Documentation

## Overview

kTracker is a fitness tracking application with RESTful API endpoints for user authentication, weight tracking, workout logging, and task management.

**Base URL:** `http://localhost:8787`

**Authentication:** JWT Bearer Token

---

## Authentication

All protected endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are obtained via the `/api/auth/login` endpoint and are valid for 7 days.

---

## API Endpoints

### Authentication Endpoints

#### Register a new user

```http
POST /api/auth/register
```

**Request Body:**

```json
{
  "username": "string (3-50 characters)",
  "email": "string (valid email)",
  "password": "string (min 6 characters)"
}
```

**Response (201 Created):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "number",
    "username": "string",
    "email": "string"
  },
  "token": "string (JWT)"
}
```

**Error Responses:**

- `400 Bad Request`: User already exists
- `500 Internal Server Error`: Registration failed

**Example:**

```bash
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

---

#### Login

```http
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "string (valid email)",
  "password": "string"
}
```

**Response (200 OK):**

```json
{
  "message": "Login successful",
  "user": {
    "id": "number",
    "username": "string",
    "email": "string"
  },
  "token": "string (JWT)"
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid credentials
- `500 Internal Server Error`: Login failed

**Example:**

```bash
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

---

### User Endpoints

*All user endpoints require authentication.*

#### Get current user profile

```http
GET /api/users/me
```

**Response (200 OK):**

```json
{
  "id": "number",
  "username": "string",
  "email": "string"
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Failed to get profile

**Example:**

```bash
curl -X GET http://localhost:8787/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

#### Update current user profile

```http
PUT /api/users/me
```

**Request Body:**

```json
{
  "username": "string (3-50 characters, optional)",
  "email": "string (valid email, optional)"
}
```

**Response (200 OK):**

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "number",
    "username": "string",
    "email": "string"
  }
}
```

**Error Responses:**

- `400 Bad Request`: Email or username already in use
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Failed to update profile

**Example:**

```bash
curl -X PUT http://localhost:8787/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newusername",
    "email": "newemail@example.com"
  }'
```

---

#### Delete current user account

```http
DELETE /api/users/me
```

**Response (200 OK):**

```json
{
  "message": "Account deleted successfully"
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Failed to delete account

**Example:**

```bash
curl -X DELETE http://localhost:8787/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Weight Tracking Endpoints

*All weight endpoints require authentication.*

#### Get weight history

```http
GET /api/weight
```

**Response (200 OK):**

```json
[
  {
    "id": "number",
    "userId": "number",
    "date": "string (ISO 8601 datetime)",
    "weight": "number"
  }
]
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Failed to get weight history

**Example:**

```bash
curl -X GET http://localhost:8787/api/weight \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

#### Add weight entry

```http
POST /api/weight
```

**Request Body:**

```json
{
  "weight": "number (positive)",
  "date": "string (ISO 8601 datetime, optional, defaults to current time)"
}
```

**Response (201 Created):**

```json
{
  "id": "number",
  "userId": "number",
  "date": "string (ISO 8601 datetime)",
  "weight": "number"
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Failed to create weight entry

**Example:**

```bash
curl -X POST http://localhost:8787/api/weight \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "weight": 75.5,
    "date": "2024-01-15T10:30:00Z"
  }'
```

---

#### Update weight entry

```http
PUT /api/weight/:id
```

**Path Parameters:**

- `id`: Weight entry ID (number)

**Request Body:**

```json
{
  "weight": "number (positive)",
  "date": "string (ISO 8601 datetime, optional)"
}
```

**Response (200 OK):**

```json
{
  "id": "number",
  "userId": "number",
  "date": "string (ISO 8601 datetime)",
  "weight": "number"
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Weight entry not found
- `500 Internal Server Error`: Failed to update weight entry

**Example:**

```bash
curl -X PUT http://localhost:8787/api/weight/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "weight": 76.0,
    "date": "2024-01-16T10:30:00Z"
  }'
```

---

#### Delete weight entry

```http
DELETE /api/weight/:id
```

**Path Parameters:**

- `id`: Weight entry ID (number)

**Response (200 OK):**

```json
{
  "message": "Weight entry deleted successfully"
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Weight entry not found
- `500 Internal Server Error`: Failed to delete weight entry

**Example:**

```bash
curl -X DELETE http://localhost:8787/api/weight/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Workout Endpoints

*All workout endpoints require authentication.*

#### Get workout history

```http
GET /api/workouts
```

**Response (200 OK):**

```json
[
  {
    "id": "number",
    "userId": "number",
    "date": "string (ISO 8601 datetime)",
    "duration": "number (minutes)",
    "exercises": [
      {
        "id": "number",
        "workoutId": "number",
        "exerciseId": "number",
        "sets": "number",
        "reps": "number",
        "weight": "number",
        "exercise": {
          "id": "number",
          "name": "string",
          "type": "string"
        }
      }
    ]
  }
]
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Failed to get workout history

**Example:**

```bash
curl -X GET http://localhost:8787/api/workouts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

#### Create workout with exercises

```http
POST /api/workouts
```

**Request Body:**

```json
{
  "date": "string (ISO 8601 datetime, optional, defaults to current time)",
  "duration": "number (minutes, positive integer)",
  "exercises": [
    {
      "exerciseId": "number (positive integer)",
      "sets": "number (positive integer)",
      "reps": "number (positive integer)",
      "weight": "number (positive)"
    }
  ]
}
```

**Response (201 Created):**

```json
{
  "id": "number",
  "userId": "number",
  "date": "string (ISO 8601 datetime)",
  "duration": "number",
  "exercises": [
    {
      "id": "number",
      "workoutId": "number",
      "exerciseId": "number",
      "sets": "number",
      "reps": "number",
      "weight": "number",
      "exercise": {
        "id": "number",
        "name": "string",
        "type": "string"
      }
    }
  ]
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Failed to create workout

**Example:**

```bash
curl -X POST http://localhost:8787/api/workouts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15T10:00:00Z",
    "duration": 45,
    "exercises": [
      {
        "exerciseId": 1,
        "sets": 3,
        "reps": 10,
        "weight": 20.5
      }
    ]
  }'
```

---

#### Update workout

```http
PUT /api/workouts/:id
```

**Path Parameters:**

- `id`: Workout ID (number)

**Request Body:**

```json
{
  "date": "string (ISO 8601 datetime, optional)",
  "duration": "number (minutes, positive integer)"
}
```

**Response (200 OK):**

```json
{
  "id": "number",
  "userId": "number",
  "date": "string (ISO 8601 datetime)",
  "duration": "number",
  "exercises": [
    {
      "id": "number",
      "workoutId": "number",
      "exerciseId": "number",
      "sets": "number",
      "reps": "number",
      "weight": "number",
      "exercise": {
        "id": "number",
        "name": "string",
        "type": "string"
      }
    }
  ]
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Workout not found
- `500 Internal Server Error`: Failed to update workout

**Example:**

```bash
curl -X PUT http://localhost:8787/api/workouts/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-16T10:00:00Z",
    "duration": 50
  }'
```

---

#### Delete workout

```http
DELETE /api/workouts/:id
```

**Path Parameters:**

- `id`: Workout ID (number)

**Response (200 OK):**

```json
{
  "message": "Workout deleted successfully"
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Workout not found
- `500 Internal Server Error`: Failed to delete workout

**Example:**

```bash
curl -X DELETE http://localhost:8787/api/workouts/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Task Endpoints

*All task endpoints require authentication.*

#### Get task list

```http
GET /api/tasks
```

**Response (200 OK):**

```json
[
  {
    "id": "number",
    "userId": "number",
    "title": "string",
    "description": "string",
    "dueDate": "string (ISO 8601 datetime or null)",
    "priority": "string (low|medium|high)",
    "completed": "boolean"
  }
]
```

**Note:** Tasks are ordered by completion status (incomplete first), priority (high to low), and due date (earliest first).

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Failed to get tasks

**Example:**

```bash
curl -X GET http://localhost:8787/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

#### Create task

```http
POST /api/tasks
```

**Request Body:**

```json
{
  "title": "string (1-200 characters)",
  "description": "string (optional)",
  "dueDate": "string (ISO 8601 datetime, optional)",
  "priority": "string (low|medium|high, defaults to medium)",
  "completed": "boolean (defaults to false)"
}
```

**Response (201 Created):**

```json
{
  "id": "number",
  "userId": "number",
  "title": "string",
  "description": "string",
  "dueDate": "string (ISO 8601 datetime or null)",
  "priority": "string",
  "completed": "boolean"
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Failed to create task

**Example:**

```bash
curl -X POST http://localhost:8787/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete workout",
    "description": "Finish leg day routine",
    "dueDate": "2024-01-20T18:00:00Z",
    "priority": "high",
    "completed": false
  }'
```

---

#### Update task

```http
PUT /api/tasks/:id
```

**Path Parameters:**

- `id`: Task ID (number)

**Request Body:**

All fields are optional.

```json
{
  "title": "string (1-200 characters, optional)",
  "description": "string (optional)",
  "dueDate": "string (ISO 8601 datetime, optional)",
  "priority": "string (low|medium|high, optional)",
  "completed": "boolean (optional)"
}
```

**Response (200 OK):**

```json
{
  "id": "number",
  "userId": "number",
  "title": "string",
  "description": "string",
  "dueDate": "string (ISO 8601 datetime or null)",
  "priority": "string",
  "completed": "boolean"
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Task not found
- `500 Internal Server Error`: Failed to update task

**Example:**

```bash
curl -X PUT http://localhost:8787/api/tasks/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true,
    "priority": "medium"
  }'
```

---

#### Delete task

```http
DELETE /api/tasks/:id
```

**Path Parameters:**

- `id`: Task ID (number)

**Response (200 OK):**

```json
{
  "message": "Task deleted successfully"
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Task not found
- `500 Internal Server Error`: Failed to delete task

**Example:**

```bash
curl -X DELETE http://localhost:8787/api/tasks/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Utility Endpoints

#### Health check

```http
GET /health
```

**Response (200 OK):**

```json
{
  "status": "ok"
}
```

**Example:**

```bash
curl http://localhost:8787/health
```

---

#### Test route

```http
GET /test
```

**Response (200 OK):**

```json
{
  "message": "Test route works!"
}
```

**Example:**

```bash
curl http://localhost:8787/test
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "string (error message)"
}
```

Common HTTP status codes:
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Data Models

### User
- `id`: number (auto-incremented)
- `username`: string (unique, 3-50 characters)
- `password`: string (hashed)
- `email`: string (unique)
- `weightEntries`: WeightEntry[] (relation)
- `workouts`: Workout[] (relation)
- `tasks`: Task[] (relation)

### WeightEntry
- `id`: number (auto-incremented)
- `userId`: number (foreign key)
- `date`: DateTime
- `weight`: Float

### Workout
- `id`: number (auto-incremented)
- `userId`: number (foreign key)
- `date`: DateTime
- `duration`: Int (minutes)
- `exercises`: WorkoutExercise[] (relation)

### Exercise
- `id`: number (auto-incremented)
- `name`: string
- `type`: string

### WorkoutExercise
- `id`: number (auto-incremented)
- `workoutId`: number (foreign key)
- `exerciseId`: number (foreign key)
- `sets`: Int
- `reps`: Int
- `weight`: Float

### Task
- `id`: number (auto-incremented)
- `userId`: number (foreign key)
- `title`: string
- `description`: string
- `dueDate`: DateTime (nullable)
- `priority`: string (low|medium|high)
- `completed`: boolean (defaults to false)

---

## Notes

1. All datetime values use ISO 8601 format (e.g., `2024-01-15T10:30:00Z`)
2. JWT tokens expire after 7 days
3. All endpoints return JSON responses
4. Authentication is required for all `/api/users`, `/api/weight`, `/api/workouts`, and `/api/tasks` endpoints except `/api/auth/register` and `/api/auth/login`
5. Passwords are hashed using bcrypt before storage
6. Users can only access their own data (implemented via authentication middleware)