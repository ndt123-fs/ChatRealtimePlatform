# Realtime Chat Application - Backend REST API

A backend application for a realtime chat system, built with **Spring Boot**, **Java 21**, **MongoDB**, **Spring Security**, **JWT** and **WebSocket/STOMP**. The system supports user registration, JWT login, chat room management, realtime messaging, typing indicators, online/offline presence, avatar upload and WebRTC signaling for video call negotiation.

This README is written in an interview-friendly format so the project can be presented as a backend portfolio project.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Realtime Communication Flow](#realtime-communication-flow)
- [Database Design](#database-design)
- [API Endpoints](#api-endpoints)
- [WebSocket Topics](#websocket-topics)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Security](#security)
- [Project Structure](#project-structure)
- [Interview Talking Points](#interview-talking-points)
- [Future Improvements](#future-improvements)

---

## Features

- **User Registration**: Create user accounts with username and password validation.
- **JWT Authentication**: Login with username and password, then receive an access token for protected APIs.
- **Password Hashing**: User passwords are hashed using BCrypt before being stored.
- **Room Management**: Create chat rooms and retrieve room information by room ID.
- **Realtime Messaging**: Send and receive messages through WebSocket using STOMP topics.
- **Message History**: Store messages inside MongoDB room documents and retrieve messages with page and size parameters.
- **Typing Indicator**: Broadcast typing events to users inside the same room.
- **Online/Offline Presence**: Track active WebSocket sessions per room and broadcast user status when users join or disconnect.
- **File Upload**: Upload files such as avatars and documents to the server filesystem.
- **Avatar Update**: Update the logged-in user's avatar URL after file upload.
- **WebRTC Signaling Support**: Forward video signaling payloads between users through STOMP user queues.
- **Global Error Handling**: Return consistent error responses for business and storage exceptions.
- **CORS Configuration**: Allow frontend origins such as local React/Vite development servers.

---

## Tech Stack

| Category | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 4.x |
| Build Tool | Maven |
| Database | MongoDB |
| Data Access | Spring Data MongoDB |
| Security | Spring Security, OAuth2 Resource Server |
| Authentication | JWT with HS512 |
| Realtime Protocol | WebSocket, STOMP, SockJS |
| Password Hashing | BCrypt |
| Validation | Jakarta Validation |
| File Upload | Spring MultipartFile |
| Utilities | Lombok |

---

## System Architecture

The application follows a standard layered backend architecture.

```text
Client Application
  |
  | REST API: HTTP + Bearer Token
  | WebSocket: STOMP + JWT header
  v
Controller Layer
  |
  v
Service Layer
  |
  v
Repository Layer
  |
  v
MongoDB
```

### Main Backend Layers

| Layer | Responsibility |
|---|---|
| Controller | Defines REST APIs and WebSocket message mappings |
| Service | Handles business logic such as user creation, login, message saving and file upload |
| Repository | Communicates with MongoDB through Spring Data repositories |
| Config | Handles security, CORS, WebSocket broker and static file mapping |
| Exception Handler | Converts exceptions into consistent JSON responses |

### Security Flow

```text
REST Request
  |
  v
Spring Security Filter Chain
  |
  v
JWT Decoder
  |
  v
Authenticated Principal
  |
  v
Controller -> Service -> MongoDB
```

### WebSocket Security Flow

```text
Client connects to /chat
  |
  v
STOMP CONNECT frame with Authorization: Bearer <token>
  |
  v
JwtChannelInterceptor validates JWT
  |
  v
Username is attached to WebSocket Principal
  |
  v
Client can send messages to /app/** destinations
```

---

## Realtime Communication Flow

### 1. User Login

The client calls the login API and receives a JWT access token.

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "john",
  "password": "123456"
}
```

Response:

```json
{
  "username": "john",
  "accessToken": "eyJ..."
}
```

### 2. WebSocket Connection

The client connects to:

```text
http://localhost:8080/chat
```

The STOMP CONNECT frame must include:

```text
Authorization: Bearer <access_token>
```

### 3. Join Room

Client sends:

```text
/app/join/{roomId}
```

Server broadcasts online status to:

```text
/topic/room/{roomId}/status
```

### 4. Send Message

Client sends message to:

```text
/app/sendMessage/{roomId}
```

Payload:

```json
{
  "content": "Hello everyone"
}
```

Server broadcasts message to:

```text
/topic/room/{roomId}
```

### 5. Typing Indicator

Client sends typing event to:

```text
/app/typing/{roomId}
```

Server broadcasts typing status to:

```text
/topic/typing/{roomId}
```

### 6. Video Call Signaling

Client sends signaling payload to:

```text
/app/video/{roomId}
```

Server forwards the payload to the target user queue:

```text
/user/queue/video/{roomId}
```

Note: This backend handles signaling only. Audio and video media streams are handled peer-to-peer by WebRTC on the frontend.

---

## Database Design

The system uses MongoDB with document-based storage.

### Core Collections

| Entity | Collection | Description |
|---|---|---|
| User | users | Stores account information, encrypted password and avatar URL |
| Room | rooms | Stores chat room information and embedded messages |

### User Document

```json
{
  "id": "65f...",
  "username": "john",
  "password": "$2a$10$...",
  "avatar": "http://localhost:8080/storage/chat/avatar.png"
}
```

### Room Document

```json
{
  "id": "65f...",
  "roomId": "room-001",
  "messages": [
    {
      "sender": "john",
      "content": "Hello everyone",
      "timeStamp": "2026-03-27T10:15:30"
    }
  ]
}
```

### Data Modeling Note

Messages are currently embedded inside the `Room` document. This keeps the project simple and makes room-level retrieval easy. For high-volume production chat, messages should be moved into a separate `messages` collection to improve pagination, indexing and scalability.

---

## API Endpoints

All REST endpoints are prefixed with `/api/v1`.

### Authentication

| Method | Path | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/login` | Login and return JWT access token | No |

### Users

| Method | Path | Description | Auth Required |
|---|---|---|---|
| POST | `/users` | Register a new user | No |
| GET | `/users/{id}` | Get user by ID | Yes |

### Rooms

| Method | Path | Description | Auth Required |
|---|---|---|---|
| POST | `/rooms` | Create a new chat room | Yes |
| GET | `/{roomId}` | Get room detail by room ID | Yes |
| GET | `/{roomId}/messages?page=0&size=20` | Get room message history | Yes |

### File Upload

| Method | Path | Description | Auth Required |
|---|---|---|---|
| POST | `/files` | Upload a file to a selected folder | Yes |
| PUT | `/files/avatar` | Update current user's avatar URL | Yes |
| GET | `/storage/**` | Access uploaded static files | No |

---

## API Examples

### Register User

```http
POST /api/v1/users
Content-Type: application/json

{
  "username": "john",
  "password": "123456"
}
```

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "john",
  "password": "123456"
}
```

### Create Room

```http
POST /api/v1/rooms
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "roomId": "room-001"
}
```

### Get Room Messages

```http
GET /api/v1/room-001/messages?page=0&size=20
Authorization: Bearer <access_token>
```

### Upload File

```http
POST /api/v1/files?folder=chat
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file=<selected_file>
```

### Update Avatar

```http
PUT /api/v1/files/avatar
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "avatar": "http://localhost:8080/storage/chat/1711500000000-avatar.png"
}
```

---

## WebSocket Topics

### Client Send Destinations

| Destination | Purpose |
|---|---|
| `/app/sendMessage/{roomId}` | Send a chat message |
| `/app/typing/{roomId}` | Send typing event |
| `/app/join/{roomId}` | Join a room and announce online status |
| `/app/video/{roomId}` | Send WebRTC signaling data |

### Client Subscribe Destinations

| Destination | Purpose |
|---|---|
| `/topic/room/{roomId}` | Receive room messages |
| `/topic/typing/{roomId}` | Receive typing events |
| `/topic/room/{roomId}/status` | Receive online/offline status |
| `/user/queue/room/{roomId}/status` | Receive current online users after joining |
| `/user/queue/video/{roomId}` | Receive private video signaling payloads |

---

## Getting Started

### Prerequisites

- Java 21+
- Maven 3.9+ or included Maven Wrapper
- MongoDB running locally or through Docker

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/chat-app-backend.git
cd chat-app-backend
```

### 2. Start MongoDB

Using local MongoDB:

```bash
mongod
```

Or using Docker:

```bash
docker run --name chatapp-mongodb -p 27017:27017 -d mongo:latest
```

### 3. Configure Application Properties

Edit:

```text
src/main/resources/application.properties
```

Use your MongoDB URI, JWT secret and upload folder.

### 4. Run the Application

Linux or macOS:

```bash
./mvnw spring-boot:run
```

Windows:

```bash
mvnw.cmd spring-boot:run
```

The backend will start on:

```text
http://localhost:8080
```

---

## Configuration

Example `application.properties`:

```properties
spring.application.name=chat-app-backend

# MongoDB
spring.data.mongodb.uri=mongodb://localhost:27017/chatapp

# JWT
hoidanit.jwt.base64-secret=YOUR_BASE64_SECRET_KEY
hoidanit.jwt.access-token-validity-in-seconds=86400
hoidanit.jwt.refresh-token-validity-in-seconds=604800

# File upload
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB
hoidanit.upload-file.base-uri=file:///C:/Hoidanit/upload/
```

Important: do not commit real JWT secrets or production upload paths into a public repository. Use environment variables or a separate production configuration file.

---

## Security

- **Stateless API**: The backend uses JWT Bearer Token authentication without server-side HTTP sessions.
- **JWT Algorithm**: Tokens are signed with HS512.
- **Password Protection**: Passwords are encoded with BCrypt.
- **Protected APIs**: Most APIs require `Authorization: Bearer <token>`.
- **Public APIs**: Login, user registration, WebSocket handshake and static storage access are allowed publicly at the HTTP security level.
- **WebSocket Token Validation**: Even though `/chat` is permitted for handshake, STOMP `CONNECT` requires a Bearer token and is validated by `JwtChannelInterceptor`.
- **Custom Auth Error Response**: Invalid or expired token errors are returned as structured JSON.
- **CORS**: Configured for common local frontend development origins.

---

## Project Structure

```text
src/main/java/Chat/app/
|-- Config/
|   |-- CorsConfig.java
|   |-- CustomAuthenticationEntryPoint.java
|   |-- JwtChannelInterceptor.java
|   |-- RoomOnlineStore.java
|   |-- SecurityConfiguration.java
|   |-- StaticResourceWebConfiguration.java
|   |-- WebSocketConfig.java
|   `-- WebSocketEventListener.java
|-- controller/
|   |-- AuthController.java
|   |-- ChatController.java
|   |-- RoomController.java
|   |-- UploadFileController.java
|   `-- UserController.java
|-- domain/
|   |-- Message.java
|   |-- Room.java
|   |-- TypingMessage.java
|   |-- User.java
|   `-- dto/
|-- errors/
|   |-- IdInvalidException.java
|   `-- StorageException.java
|-- exception/
|   `-- GlobalException.java
|-- payload/
|   `-- MessageRequest.java
|-- repository/
|   |-- RoomRepository.java
|   `-- UserRepository.java
|-- response/
|   |-- ResLoginDTO.java
|   |-- ResUploadFileDTO.java
|   `-- RestResponse.java
|-- service/
|   |-- ChatService.java
|   |-- RoomService.java
|   |-- UploadFileService.java
|   |-- UserService.java
|   `-- impl/
`-- ChatAppBackendApplication.java
```

---

## Interview Talking Points

### Why MongoDB?

MongoDB is suitable for this project because chat rooms and messages can be represented as flexible documents. For a small or medium chat room, embedding messages in the room document simplifies reads and reduces joins.

### Why WebSocket/STOMP?

REST APIs are good for request-response operations such as login, registration and room history. Realtime chat requires server push, so WebSocket is used. STOMP provides a structured messaging layer with topics, queues and application destinations.

### Why JWT?

JWT allows stateless authentication. The backend does not need to store session data, which makes the system easier to scale horizontally.

### How is user presence handled?

The backend keeps an in-memory map of active WebSocket sessions by room. When a user joins, the server broadcasts `ONLINE`. When a session disconnects, the server removes that session and broadcasts `OFFLINE`.

### How does video call support work?

The backend does not stream video. It forwards WebRTC signaling messages such as offer, answer and ICE candidates between users. The actual audio/video stream is handled directly by WebRTC clients.

### What is the main scalability limitation?

Current message storage embeds all messages inside the `Room` document. This is simple but not ideal for very large conversations. A production version should use a separate `messages` collection with indexes on `roomId` and `createdAt`.

---

## Future Improvements

- Add refresh token flow and logout endpoint.
- Add role-based access control for admin and normal users.
- Move messages into a separate collection for better scalability.
- Add message delivery status such as `SENT`, `DELIVERED` and `SEEN`.
- Add unread message count per user.
- Add friend list or direct conversation model.
- Add group chat membership management.
- Add rate limiting for login and message sending.
- Add Docker Compose for MongoDB and backend.
- Add Swagger/OpenAPI documentation.
- Add integration tests for REST APIs and WebSocket flows.

---

## License

This project is for educational and portfolio purposes.
