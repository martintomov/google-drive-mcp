# Google Drive Pure APIs

A comprehensive REST API server for Google Drive, Docs, Sheets, and Slides operations. This project converts all 39 MCP (Model Context Protocol) tools from the Google Drive MCP server into pure HTTP REST endpoints with API key authentication.

## Features

- **Complete Google Workspace API Coverage**: 39 REST endpoints covering all Drive, Docs, Sheets, and Slides operations
- **API Key Authentication**: Simple key-based authentication with backend-managed OAuth
- **OpenAPI/Swagger Documentation**: Interactive API documentation at `/api-docs`
- **Type-Safe**: Built with TypeScript and comprehensive validation using class-validator
- **Production-Ready**: Built on NestJS with enterprise-grade architecture

---

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js 18+** (recommended: 20+)
- **npm** or yarn
- **Google Cloud Project** with OAuth credentials

### Step 1: Install Dependencies

```bash
cd drive-pure-apis
npm install
```

### Step 2: Set Up Google Cloud OAuth Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **Create or Select a Project**

   - Click "Select a project" → "New Project"
   - Name it (e.g., "Drive API Server")
   - Click "Create"
3. **Enable Required APIs**

   - Go to "APIs & Services" → "Library"
   - Search and enable each of these:
     - Google Drive API
     - Google Docs API
     - Google Sheets API
     - Google Slides API
4. **Create OAuth 2.0 Credentials**

   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: "Drive Pure APIs"
   - **Authorized redirect URIs**: Add `http://localhost:3110/oauth/callback`
   - Click "Create"
   - **Copy the Client ID and Client Secret**
5. **Download Credentials**

   - Click the download button (⬇️) next to your OAuth client
   - You'll get a JSON file with your credentials

### Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your Google OAuth credentials:

```env
# Server Configuration
PORT=3110
NODE_ENV=development

# Demo API Key (for testing)
DEMO_API_KEY=demo-api-key-12345

# Google OAuth Credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3110/oauth/callback

# Optional: Logging
LOG_LEVEL=debug
```

**Replace** `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` with your actual values from Google Cloud Console.

### Step 4: Start the Server

```bash
# Development mode (with hot reload)
npm run start:dev

# Production build
npm run build
npm start
```

You should see:

```
🚀 Drive Pure APIs Server Started
📖 API Documentation: http://localhost:3110/api-docs
❤️  Health Check: http://localhost:3110/health
🔑 Authentication: API Key required (X-API-Key header)
```

### Step 5: Authorize with Google OAuth

**Important**: Before you can use any endpoints, you must authorize your API key with Google.

1. **Open your browser** and go to:

   ```
   http://localhost:3110/auth/oauth/start
   ```
2. **Sign in with Google** when prompted
3. **Grant permissions** for:

   - Google Drive
   - Google Docs
   - Google Sheets
   - Google Slides
4. **Success!** You'll see a confirmation page with your API key and upload command

### Step 6: Verify Authorization

Check that your API key is authorized:

```bash
curl http://localhost:3110/auth/oauth/status
```

Expected response:

```json
{
  "apiKey": "demo-api-key-12345",
  "hasTokens": true,
  "tokenInfo": {
    "hasAccessToken": true,
    "hasRefreshToken": true,
    "expiryDate": 1234567890
  }
}
```

---

## 📖 API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:3110/api-docs
- **Health Check**: http://localhost:3110/health

---

## 💡 Usage Examples

### Upload a PDF File

```bash
curl -X POST http://localhost:3110/files/upload-path \
  -H "X-API-Key: demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "filePath": "/path/to/your/file.pdf"
  }'
```

**Response:**

```json
{
  "id": "17Zk_kPab7EfVCSsBdIJ_OqbnejwGR_p9",
  "name": "file.pdf",
  "mimeType": "application/pdf",
  "webViewLink": "https://drive.google.com/file/d/17Zk_kPab7EfVCSsBdIJ_OqbnejwGR_p9/view?usp=drivesdk",
  "size": "484719"
}
```

### Upload a File from Base64

```bash
curl -X POST http://localhost:3110/files/upload \
  -H "X-API-Key: demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "document.pdf",
    "content": "JVBERi0xLjQKJeLjz9MK...",
    "mimeType": "application/pdf"
  }'
```

### Search for Files

```bash
curl -X POST http://localhost:3110/files/search \
  -H "X-API-Key: demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "annual report",
    "pageSize": 20
  }'
```

### Create a Google Doc

```bash
curl -X POST http://localhost:3110/docs \
  -H "X-API-Key: demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Document",
    "content": "Hello, World!"
  }'
```

**Response:**

```json
{
  "documentId": "1abc123...",
  "title": "My Document",
  "url": "https://docs.google.com/document/d/1abc123.../edit"
}
```

### Create a Google Sheet

```bash
curl -X POST http://localhost:3110/sheets \
  -H "X-API-Key: demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sales Report 2024",
    "sheetNames": ["January", "February"]
  }'
```

### Update Spreadsheet Cells

```bash
curl -X PUT http://localhost:3110/sheets/SPREADSHEET_ID \
  -H "X-API-Key: demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "sheetName": "Sheet1",
    "range": "A1:B2",
    "values": [
      ["Name", "Value"],
      ["Item 1", "100"]
    ]
  }'
```

### Create a Google Slides Presentation

```bash
curl -X POST http://localhost:3110/slides \
  -H "X-API-Key: demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Q4 2024 Report",
    "slideCount": 5
  }'
```

### Add a Text Box to a Slide

```bash
curl -X POST http://localhost:3110/slides/PRESENTATION_ID/textbox \
  -H "X-API-Key: demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "slideIndex": 0,
    "text": "Welcome to our presentation!",
    "x": 914400,
    "y": 914400,
    "width": 3000000,
    "height": 1000000
  }'
```

### Create a Folder

```bash
curl -X POST http://localhost:3110/files/folder \
  -H "X-API-Key: demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "/Work/2024/Reports"
  }'
```

### List Folder Contents

```bash
curl -X GET "http://localhost:3110/files/folder/root" \
  -H "X-API-Key: demo-api-key-12345"
```

### Delete a File

```bash
curl -X DELETE http://localhost:3110/files/FILE_ID \
  -H "X-API-Key: demo-api-key-12345"
```

---

## 📚 Available Endpoints

### Files (10 endpoints)

| Method | Endpoint               | Description                          |
| ------ | ---------------------- | ------------------------------------ |
| POST   | `/files/search`      | Search for files in Drive            |
| GET    | `/files/folder/:id`  | List folder contents                 |
| POST   | `/files/folder`      | Create a new folder (supports paths) |
| POST   | `/files/text`        | Create a text file (.txt, .md)       |
| PUT    | `/files/text/:id`    | Update text file content             |
| POST   | `/files/upload`      | Upload binary file (base64)          |
| POST   | `/files/upload-path` | Upload from local path               |
| DELETE | `/files/:id`         | Delete file/folder (trash)           |
| PATCH  | `/files/:id/rename`  | Rename file/folder                   |
| PATCH  | `/files/:id/move`    | Move file/folder                     |

### Google Docs (5 endpoints)

| Method | Endpoint                       | Description                                      |
| ------ | ------------------------------ | ------------------------------------------------ |
| POST   | `/docs`                      | Create a new Google Doc                          |
| PUT    | `/docs/:id`                  | Update document content                          |
| GET    | `/docs/:id`                  | Get document content                             |
| PATCH  | `/docs/:id/format-text`      | Format text (bold, italic, color, size)          |
| PATCH  | `/docs/:id/format-paragraph` | Format paragraphs (headings, alignment, spacing) |

### Google Sheets (10 endpoints)

| Method | Endpoint                           | Description                                    |
| ------ | ---------------------------------- | ---------------------------------------------- |
| POST   | `/sheets`                        | Create a new spreadsheet                       |
| PUT    | `/sheets/:id`                    | Update cells with values                       |
| GET    | `/sheets/:id`                    | Get spreadsheet content                        |
| PATCH  | `/sheets/:id/format-cells`       | Format cells (background, alignment, wrapping) |
| PATCH  | `/sheets/:id/format-text`        | Format text in cells (font, color, bold)       |
| PATCH  | `/sheets/:id/format-numbers`     | Format numbers/dates/currency                  |
| PATCH  | `/sheets/:id/borders`            | Set cell borders                               |
| PATCH  | `/sheets/:id/merge`              | Merge cells                                    |
| POST   | `/sheets/:id/conditional-format` | Add conditional formatting                     |

### Google Slides (10 endpoints)

| Method | Endpoint                         | Description                            |
| ------ | -------------------------------- | -------------------------------------- |
| POST   | `/slides`                      | Create a new presentation              |
| GET    | `/slides/:id`                  | Get presentation content               |
| POST   | `/slides/:id/textbox`          | Create a text box on a slide           |
| POST   | `/slides/:id/shape`            | Create a shape on a slide              |
| PATCH  | `/slides/:id/format-text`      | Format text in elements                |
| PATCH  | `/slides/:id/format-paragraph` | Format paragraphs (alignment, bullets) |
| PATCH  | `/slides/:id/style-shape`      | Style shapes (fill, outline)           |
| PATCH  | `/slides/:id/background`       | Set slide background color             |

### System & Auth Endpoints

| Method | Endpoint               | Description                      |
| ------ | ---------------------- | -------------------------------- |
| GET    | `/health`            | Health check (no auth required)  |
| GET    | `/api-docs`          | Swagger UI documentation         |
| GET    | `/auth/oauth/start`  | Start OAuth authorization flow   |
| GET    | `/oauth/callback`    | OAuth callback (internal)        |
| GET    | `/auth/oauth/status` | Check OAuth authorization status |

---

## 🔑 Authentication

### API Key Header

All endpoints (except `/health`, `/api-docs`, and OAuth endpoints) require an API key:

**Header (Recommended):**

```bash
-H "X-API-Key: demo-api-key-12345"
```

**Query Parameter:**

```bash
?api_key=demo-api-key-12345
```

### OAuth Flow

The OAuth flow is handled automatically:

1. **Start OAuth**: Visit `http://localhost:3110/auth/oauth/start`
2. **Authorize with Google**: Grant permissions
3. **Done!**: Tokens are stored and auto-refreshed

Check authorization status:

```bash
curl http://localhost:3110/auth/oauth/status
```

---

## 🏗️ Architecture

### Technology Stack

- **Framework**: NestJS 11.x (TypeScript)
- **Validation**: class-validator + class-transformer
- **Documentation**: @nestjs/swagger + Swagger UI
- **Google APIs**: googleapis 170.x
- **Authentication**: Custom API key system with OAuth2 backend
- **Environment**: dotenv for configuration

### Project Structure

```
src/
├── main.ts                  # Application bootstrap
├── app.module.ts            # Root module
├── app.controller.ts        # Health check
├── oauth.controller.ts      # OAuth callback handler
├── auth/                    # Authentication module
│   ├── auth.module.ts
│   ├── auth.controller.ts   # OAuth flow endpoints
│   ├── auth.service.ts      # API key management
│   ├── auth.guard.ts        # API key validation
│   └── decorators/          # Custom decorators
├── google/                  # Google OAuth integration
│   ├── google.module.ts
│   └── google.service.ts    # OAuth client management
├── files/                   # File management endpoints
│   ├── files.module.ts
│   ├── files.controller.ts
│   ├── files.service.ts
│   └── dto/                 # Request/response DTOs
├── docs/                    # Google Docs endpoints
├── sheets/                  # Google Sheets endpoints
└── slides/                  # Google Slides endpoints
```

---

## 🔧 Configuration

### Environment Variables

| Variable                 | Description                       | Example                                         |
| ------------------------ | --------------------------------- | ----------------------------------------------- |
| `PORT`                 | Server port                       | `3110`                                        |
| `NODE_ENV`             | Environment                       | `development` or `production`               |
| `DEMO_API_KEY`         | Demo API key for testing          | `demo-api-key-12345`                          |
| `GOOGLE_CLIENT_ID`     | OAuth Client ID from Google Cloud | `132846908399-xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret               | `GOCSPX-xxxxx`                                |
| `GOOGLE_REDIRECT_URI`  | OAuth redirect URI                | `http://localhost:3110/oauth/callback`        |
| `LOG_LEVEL`            | Logging level                     | `debug`                                       |

### API Key Storage

**Development**: API keys are stored in-memory (lost on restart)

**Production**: Modify `src/auth/auth.service.ts` to use:

- PostgreSQL / MongoDB
- Redis
- External key management service (AWS Secrets Manager, HashiCorp Vault)

---

## 🚨 Error Handling

The API returns standard HTTP status codes:

| Code    | Meaning                                |
| ------- | -------------------------------------- |
| `200` | Success                                |
| `201` | Created successfully                   |
| `400` | Bad request (invalid parameters)       |
| `401` | Unauthorized (invalid/missing API key) |
| `404` | Resource not found                     |
| `500` | Server error                           |

**Error Response Format:**

```json
{
  "statusCode": 401,
  "message": "Invalid API key",
  "error": "Unauthorized"
}
```

---

## 🐛 Troubleshooting

### OAuth Authorization Failed

**Problem**: Getting 404 on OAuth callback

**Solution**:

1. Check that `GOOGLE_REDIRECT_URI` in `.env` matches your Google Cloud Console settings
2. Make sure it's set to `http://localhost:3110/oauth/callback` (with port 3110)
3. Restart the server after changing `.env`

### Port Already in Use

**Problem**: `EADDRINUSE: address already in use :::3110`

**Solution**:

```bash
# Kill process on port 3110
lsof -ti:3110 | xargs kill -9

# Or change PORT in .env to a different port
```

### No OAuth Tokens

**Problem**: Getting "No Google OAuth tokens found for this API key"

**Solution**: Visit `http://localhost:3110/auth/oauth/start` to authorize your API key

### Invalid API Key

**Problem**: Getting "Invalid API key" error

**Solution**:

1. Make sure you're using the API key from your `.env` file
2. Default demo key is: `demo-api-key-12345`
3. Include it in the `X-API-Key` header

---

## 📦 Development

### Building

```bash
npm run build
```

### Running in Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm start
```
