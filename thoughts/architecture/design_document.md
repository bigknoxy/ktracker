# BUSINESS POSTURE

The primary business goal is to launch an MVP for a weight, workout, and task management application. This MVP aims to validate the market need for a combined fitness and productivity tool. Success will be measured by user registration, active usage (daily/weekly), and user feedback. The application targets individuals interested in tracking their health and productivity in a single place.

Key business priorities include: rapid development and deployment, user acquisition, and gathering user feedback for iterative improvements.

Important business risks:

- Lack of user adoption: The application may not attract enough users to justify further development.
- Competition: Existing fitness and productivity apps may offer similar functionality.
- Scalability issues: The application may not be able to handle a large number of users.
- Data loss: Loss of user data could damage the application's reputation.

# SECURITY POSTURE

Existing security controls:

- security control: Basic user authentication (username/password).
- accepted risk: Limited authentication strength in MVP.

Recommended security controls:

- security control: Input validation on all API endpoints to prevent injection attacks.
- security control: Implement rate limiting on API endpoints to prevent abuse.
- security control: Utilize environment variables for sensitive configuration data (e.g., database credentials).
- security control: Regular security scans of the application code and dependencies.
- security control: Implement HTTPS for all communication.

Security requirements:

- User data must be protected from unauthorized access.
- Passwords must be stored securely (hashed and salted).
- The application must be resistant to common web vulnerabilities (e.g., XSS, CSRF).
- Data backups must be performed regularly.
- Compliance with relevant data privacy regulations (e.g., GDPR, CCPA) should be considered for future iterations.

# DESIGN

## UI Modernization (2025-09)

The frontend UI was modernized to improve usability, accessibility, and aesthetics:

- **Dark Mode:** Implemented via Tailwind's dark mode and a global ThemeContext. Users can toggle dark/light themes, with state persisted in localStorage.
- **Mobile Navigation:** Added a fixed BottomNav for mobile users, providing quick access to all main sections. Desktop navigation remains in the header.
- **Responsive Layouts:** All major components use Tailwind responsive classes for optimal experience across devices. Layouts stack and space appropriately for mobile, tablet, and desktop.
- **Smooth Transitions:** Section changes and key UI elements use fade-in transitions for a polished, modern feel.
- **Skeleton Loaders:** Loading states use animated skeleton loaders for cards, lists, and charts, improving perceived performance and user experience.

### Component Patterns
- Theme state is managed globally via React context (`ThemeContext.tsx`).
- Navigation state is managed in the main page (`Dashboard.tsx`) and passed to navigation components.
- Skeleton loaders are reusable and parameterized for different loading scenarios.
- All components are mobile-first and support dark mode.


## C4 CONTEXT

```mermaid
system_context_diagram
  system("Weight, Workout, and Task Management Application", "TypeScript, Bun, PostgreSQL")
  user("User", "Individual tracking fitness and tasks")
  system_db("PostgreSQL Database", "Stores user data, workouts, weights, and tasks")
  system_ext("External API (Future)", "Integration with other fitness trackers")

  user -- interacts with --> system
  system -- reads/writes --> system_db
  system -- interacts with --> system_ext
```

| Name | Type | Description | Responsibilities | Security controls |
|---|---|---|---|---|
| Weight, Workout, and Task Management Application | System | The core application providing weight, workout, and task tracking features. |  Handles user requests, manages data, and provides the user interface. | Input validation, authentication, HTTPS. |
| User | User | An individual using the application to track their fitness and tasks. | Provides input, views data, and interacts with the application. |  Responsible for maintaining password security. |
| PostgreSQL Database | System Database | Stores all application data, including user accounts, weight entries, workouts, and tasks. |  Provides persistent storage for application data. | Access control, encryption at rest (future). |
| External API (Future) | External System | Represents potential integration with other fitness trackers or services. |  Provides data exchange with external systems. | API key authentication, data validation. |

## C4 CONTAINER

```mermaid
container_diagram
  system("Weight, Workout, and Task Management Application", "TypeScript, Bun, PostgreSQL")
  container("Web Application", "TypeScript, Bun", "Provides the user interface and handles user interactions")
  container("API Application", "TypeScript, Bun", "Handles API requests and business logic")
  container("PostgreSQL Database", "PostgreSQL", "Stores application data")

  user -- interacts with --> Web Application
  Web Application -- makes API calls to --> API Application
  API Application -- reads/writes --> PostgreSQL Database
```

| Name | Type | Description | Responsibilities | Security controls |
|---|---|---|---|---|
| Weight, Workout, and Task Management Application | System | The overall system. | Orchestrates the interaction between containers. | N/A |
| Web Application | Container | The user interface of the application. |  Handles user interactions, displays data, and provides a user-friendly experience. | Input validation, output encoding, CSRF protection. |
| API Application | Container | The backend API that handles requests from the web application. |  Handles API requests, performs business logic, and interacts with the database. | Authentication, authorization, input validation, rate limiting. |
| PostgreSQL Database | Container | The database that stores application data. |  Provides persistent storage for application data. | Access control, encryption at rest (future). |

## C4 DEPLOYMENT

```mermaid
deployment_diagram
  system("Weight, Workout, and Task Management Application", "TypeScript, Bun, PostgreSQL")
  node("Cloud Provider (e.g., AWS, Azure, GCP)", "Infrastructure as a Service")
  container("Web Application", "TypeScript, Bun", "Deployed as a Docker container")
  container("API Application", "TypeScript, Bun", "Deployed as a Docker container")
  container("PostgreSQL Database", "PostgreSQL", "Deployed as a managed service")

  node -- hosts --> Web Application
  node -- hosts --> API Application
  node -- provides --> PostgreSQL Database
```

| Name | Type | Description | Responsibilities | Security controls |
|---|---|---|---|---|
| Weight, Workout, and Task Management Application | System | The overall system. | N/A | N/A |
 | Cloud Provider | Node | The infrastructure provider hosting the application. | Provides compute, storage, and networking resources. | Network security groups, access control, monitoring. |
 | Web Application | Container | The user interface of the application. |  Handles user interactions and displays data. | Docker security best practices, container image scanning. |
 | API Application | Container | The backend API that handles requests from the web application. |  Handles API requests and performs business logic. | Docker security best practices, container image scanning. |
 | PostgreSQL Database | Container | The database that stores application data. |  Provides persistent storage for application data. | Managed service security features, access control. |

## TECHNOLOGY STACK

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend Runtime** | Bun v1.2.21 | High-performance JavaScript runtime for TypeScript execution |
| **API Framework** | Hono | Lightweight, fast web framework for building APIs |
| **Database ORM** | Prisma | Type-safe database client and migration tool |
| **Database (Dev)** | SQLite | Embedded database for development and testing |
| **Database (Prod)** | PostgreSQL | Production-grade relational database |
| **Authentication** | bcrypt + JWT | Password hashing and token-based authentication |
| **Validation** | Zod | Runtime type validation and schema definition |
| **Frontend Framework** | React 19 + TypeScript | Modern UI component library |
| **Build Tool** | Vite | Fast development server and optimized builds |
| **Styling** | Tailwind CSS 4.x | Utility-first CSS framework with dark mode |
| **Charts** | Recharts | Declarative charting library for data visualization |
| **HTTP Client** | Axios | Promise-based HTTP client for API requests |
| **Form Handling** | React Hook Form + Zod | Form validation and management |
| **Testing** | Cypress | End-to-end testing framework |
| **DevOps** | Docker, Git, Husky | Containerization, version control, pre-commit hooks |

## DATABASE SCHEMA

The application uses Prisma ORM with the following data models:

### User Model
```prisma
model User {
  id          Int      @id @default(autoincrement())
  username    String   @unique
  password    String   @db.Text
  email       String   @unique
  weightEntries WeightEntry[]
  workouts    Workout[]
  tasks       Task[]
}
```
- **Purpose**: Stores user authentication and profile information
- **Relations**: One-to-many with WeightEntry, Workout, and Task
- **Security**: Password is hashed using bcrypt before storage

### WeightEntry Model
```prisma
model WeightEntry {
  id       Int      @id @default(autoincrement())
  user     User     @relation(fields: [userId], references: [id])
  userId   Int
  date     DateTime
  weight   Float
}
```
- **Purpose**: Tracks weight measurements over time
- **Validation**: Weight must be positive, date defaults to current time
- **Indexing**: Automatically indexed on user and date for efficient queries

### Workout Model
```prisma
model Workout {
  id         Int      @id @default(autoincrement())
  user       User     @relation(fields: [userId], references: [id])
  userId     Int
  date       DateTime
  duration   Int
  exercises  WorkoutExercise[]
}
```
- **Purpose**: Stores workout session information
- **Relations**: One-to-many with WorkoutExercise (exercise details)
- **Fields**: Duration in minutes, date of workout

### Exercise Model
```prisma
model Exercise {
  id       Int      @id @default(autoincrement())
  name     String
  type     String
  workoutExercises WorkoutExercise[]
}
```
- **Purpose**: Defines exercise types (e.g., "Squat", "Bench Press")
- **Types**: Strength, Cardio, Flexibility, etc.
- **Reusability**: One exercise can appear in multiple workouts

### WorkoutExercise Model
```prisma
model WorkoutExercise {
  id         Int      @id @default(autoincrement())
  workout    Workout  @relation(fields: [workoutId], references: [id])
  workoutId  Int
  exercise   Exercise @relation(fields: [exerciseId], references: [id])
  exerciseId Int
  sets       Int
  reps       Int
  weight     Float
}
```
- **Purpose**: Links workouts to specific exercises with performance data
- **Fields**: Number of sets, reps per set, and weight used
- **Validation**: All fields must be positive integers/floats

### Task Model
```prisma
model Task {
  id          Int      @id @default(autoincrement())
  user        User     @relation(fields: [userId], references: [id])
  userId      Int
  title       String
  description String   @db.Text
  dueDate     DateTime?
  priority    String
  completed   Boolean @default(false)
}
```
- **Purpose**: Manages productivity tasks with priority and completion tracking
- **Priorities**: low, medium, high
- **Due Date**: Optional date for task completion
- **Completion**: Boolean flag for task status

## API ENDPOINTS

### Authentication Endpoints

#### POST `/api/auth/register`
- **Purpose**: Register a new user account
- **Request Body**:
  ```json
  {
    "username": "string (3-50 chars)",
    "email": "valid email",
    "password": "string (min 6 chars)"
  }
  ```
- **Response** (201):
  ```json
  {
    "message": "User registered successfully",
    "user": { "id": 1, "username": "...", "email": "..." },
    "token": "jwt_token"
  }
  ```
- **Validation**: Zod schema validation, checks for duplicate username/email

#### POST `/api/auth/login`
- **Purpose**: Authenticate existing user
- **Request Body**:
  ```json
  {
    "email": "valid email",
    "password": "string"
  }
  ```
- **Response** (200):
  ```json
  {
    "message": "Login successful",
    "user": { "id": 1, "username": "...", "email": "..." },
    "token": "jwt_token"
  }
  ```
- **Security**: Verifies password using bcrypt comparison

### User Endpoints

#### GET `/api/users/me`
- **Purpose**: Get current user profile
- **Authentication**: Required (JWT in Authorization header)
- **Response** (200):
  ```json
  {
    "id": 1,
    "username": "...",
    "email": "..."
  }
  ```

#### PUT `/api/users/me`
- **Purpose**: Update current user profile
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "username": "string (3-50 chars, optional)",
    "email": "valid email (optional)"
  }
  ```
- **Response** (200):
  ```json
  {
    "message": "Profile updated successfully",
    "user": { "id": 1, "username": "...", "email": "..." }
  }
  ```

#### DELETE `/api/users/me`
- **Purpose**: Delete current user account
- **Authentication**: Required
- **Response** (200):
  ```json
  {
    "message": "Account deleted successfully"
  }
  ```
- **Cascade**: Deletes all related data (tasks, workouts, weight entries)

### Weight Tracking Endpoints

#### GET `/api/weight`
- **Purpose**: Get weight history for authenticated user
- **Authentication**: Required
- **Response** (200):
  ```json
  [
    {
      "id": 1,
      "userId": 1,
      "date": "2025-12-26T10:00:00Z",
      "weight": 75.5
    }
  ]
  ```
- **Ordering**: Descending by date (most recent first)

#### POST `/api/weight`
- **Purpose**: Add new weight entry
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "weight": 75.5,
    "date": "2025-12-26T10:00:00Z (optional)"
  }
  ```
- **Response** (201): Created weight entry object
- **Default**: Date defaults to current time if not provided

#### PUT `/api/weight/:id`
- **Purpose**: Update existing weight entry
- **Authentication**: Required
- **Request Body**: Same as POST
- **Response** (200): Updated weight entry object
- **Authorization**: User can only update their own entries

#### DELETE `/api/weight/:id`
- **Purpose**: Delete weight entry
- **Authentication**: Required
- **Response** (200):
  ```json
  {
    "message": "Weight entry deleted successfully"
  }
  ```
- **Authorization**: User can only delete their own entries

### Workout Endpoints

#### GET `/api/workouts`
- **Purpose**: Get workout history for authenticated user
- **Authentication**: Required
- **Response** (200):
  ```json
  [
    {
      "id": 1,
      "userId": 1,
      "date": "2025-12-26T10:00:00Z",
      "duration": 60,
      "exercises": [
        {
          "id": 1,
          "sets": 3,
          "reps": 10,
          "weight": 100,
          "exercise": {
            "id": 1,
            "name": "Squat",
            "type": "Strength"
          }
        }
      ]
    }
  ]
  ```
- **Ordering**: Descending by date
- **Includes**: Nested exercise details

#### POST `/api/workouts`
- **Purpose**: Create new workout with exercises
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "date": "2025-12-26T10:00:00Z (optional)",
    "duration": 60,
    "exercises": [
      {
        "exerciseId": 1,
        "sets": 3,
        "reps": 10,
        "weight": 100
      }
    ]
  }
  ```
- **Response** (201): Created workout with nested exercises
- **Validation**: At least one exercise required

#### PUT `/api/workouts/:id`
- **Purpose**: Update workout metadata (date, duration)
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "date": "2025-12-26T10:00:00Z (optional)",
    "duration": 60
  }
  ```
- **Response** (200): Updated workout with exercises

#### DELETE `/api/workouts/:id`
- **Purpose**: Delete workout and all exercises
- **Authentication**: Required
- **Response** (200):
  ```json
  {
    "message": "Workout deleted successfully"
  }
  ```

### Task Endpoints

#### GET `/api/tasks`
- **Purpose**: Get task list for authenticated user
- **Authentication**: Required
- **Response** (200):
  ```json
  [
    {
      "id": 1,
      "userId": 1,
      "title": "Complete project",
      "description": "Finish the MVP",
      "dueDate": "2025-12-31T10:00:00Z",
      "priority": "high",
      "completed": false
    }
  ]
  ```
- **Ordering**: Incomplete first, then by priority (high→low), then by due date

#### POST `/api/tasks`
- **Purpose**: Create new task
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "title": "Complete project",
    "description": "Finish the MVP (optional)",
    "dueDate": "2025-12-31T10:00:00Z (optional)",
    "priority": "high (default: medium)",
    "completed": false (default)
  }
  ```
- **Response** (201): Created task object

#### PUT `/api/tasks/:id`
- **Purpose**: Update task
- **Authentication**: Required
- **Request Body**: Any field from POST (all optional)
- **Response** (200): Updated task object

#### DELETE `/api/tasks/:id`
- **Purpose**: Delete task
- **Authentication**: Required
- **Response** (200):
  ```json
  {
    "message": "Task deleted successfully"
  }
  ```

## AUTHENTICATION FLOW

### Registration Flow
1. User submits registration form with username, email, and password
2. Backend validates input using Zod schemas
3. Backend checks if username or email already exists
4. Backend hashes password using bcrypt (10 salt rounds)
5. Backend creates user record in database
6. Backend generates JWT token containing userId and email
7. Backend returns user data and JWT token
8. Frontend stores JWT in localStorage and redirects to dashboard

### Login Flow
1. User submits login form with email and password
2. Backend validates input using Zod schemas
3. Backend retrieves user by email from database
4. Backend compares password hash using bcrypt
5. Backend generates JWT token containing userId and email
6. Backend returns user data and JWT token
7. Frontend stores JWT in localStorage and redirects to dashboard

### Protected Route Flow
1. Frontend includes JWT in Authorization header: `Bearer <token>`
2. Backend extracts token from header
3. Backend validates JWT signature and expiration
4. Backend extracts userId and email from decoded token
5. Backend attaches user info to request context
6. Backend processes request with user context
7. Backend returns data or 401 if invalid token

### JWT Token Structure
```json
{
  "userId": 1,
  "email": "user@example.com",
  "iat": 1735224000,
  "exp": 1735828800
}
```
- **Expiration**: 7 days from issuance
- **Secret**: Configured via JWT_SECRET environment variable
- **Algorithm**: HS256 (default)

## DATA FLOW

### Weight Tracking Data Flow
1. User enters weight value (and optional date) in form
2. Frontend validates input (must be positive number)
3. Frontend sends POST request to `/api/weight` with JWT in header
4. Backend validates request using Zod schema
5. Backend authenticates user via JWT middleware
6. Backend creates WeightEntry record in database
7. Backend returns created entry with generated ID
8. Frontend updates local state and refetches weight history
9. Frontend renders updated list and chart
10. Chart visualizes weight trends over time

### Workout Logging Data Flow
1. User creates workout with multiple exercises
2. User selects exercises from predefined list (Exercise model)
3. User enters sets, reps, and weight for each exercise
4. Frontend validates all exercise data
5. Frontend sends POST request to `/api/workouts` with JWT
6. Backend validates request structure
7. Backend authenticates user via JWT middleware
8. Backend creates Workout record in database
9. Backend creates nested WorkoutExercise records
10. Backend returns workout with nested exercise data
11. Frontend updates local state and refetches workout history
12. Frontend renders workout list with exercise details

### Task Management Data Flow
1. User creates task with title, description, priority, and due date
2. Frontend validates input (title required, others optional)
3. Frontend sends POST request to `/api/tasks` with JWT
4. Backend validates request using Zod schema
5. Backend authenticates user via JWT middleware
6. Backend creates Task record in database
7. Backend returns created task with generated ID
8. Frontend updates local state and refetches task list
9. Backend sorts tasks: incomplete → priority (high→low) → due date
10. Frontend renders sorted task list with completion checkboxes
11. User toggles task completion → PUT request updates task
12. Frontend re-renders list with updated sorting

### Dashboard Data Aggregation
1. User navigates to dashboard
2. Frontend sends parallel GET requests:
   - GET `/api/weight` for weight history
   - GET `/api/workouts` for workout history
   - GET `/api/tasks` for task list
3. Backend authenticates user via JWT middleware for each request
4. Backend fetches user-specific data from database
5. Backend returns sorted, filtered data
6. Frontend displays aggregated data in sections
7. Weight chart visualizes trends
8. Workout list shows recent sessions
9. Task list shows prioritized items
10. All data updates in real-time as user interacts

# RISK ASSESSMENT

- What are critical business process we are trying to protect? User registration, weight/workout/task data recording and retrieval, and the overall application availability.
- What data we are trying to protect and what is their sensitivity? User credentials (high sensitivity), personal health data (weight, workout details - high sensitivity), task information (moderate sensitivity).

# QUESTIONS & ASSUMPTIONS

Questions:

- What is the expected user base size in the short and long term?
- What are the specific requirements for data retention and backup?
- What level of integration with external services is anticipated?
- What is the budget for security measures?

Assumptions:

- BUSINESS POSTURE: The MVP will be launched quickly with minimal features and security controls, with iterative improvements based on user feedback.
- SECURITY POSTURE: Basic user authentication is sufficient for the MVP, but more robust authentication methods will be implemented later.
- DESIGN: The application will be deployed on a cloud provider with managed services for database and infrastructure. Bun's performance benefits will be realized without significant code changes.

