# Veteran Compass Corps

Veteran made service to assist veterans in disability claims through the VA.

## Project Structure

```
Veteran_Compass_Corps/
├── src/
│   ├── prompts/           # AI prompt architecture modules
│   │   ├── system.js          # Core identity, rules, and guardrails
│   │   ├── developer.js      # Response structure and formatting
│   │   ├── tier.js           # Free vs Member response depth
│   │   ├── voice.js          # Brand voice and tone
│   │   ├── templates.js      # Behavioral templates and guidelines
│   │   └── index.js          # Main composition module (buildPrompt)
│   ├── services/         # Service modules
│   │   ├── supabase.js       # Supabase client initialization
│   │   ├── auth.js           # Token verification
│   │   ├── membership.js     # Membership status checks
│   │   ├── usage.js          # AI usage tracking (monthly limits)
│   │   └── openai.js         # OpenAI client and chat completion
│   ├── routes/           # API route handlers
│   │   └── chat.js           # Chat API endpoint
│   └── knowledge/       # Knowledge base files
│       └── va_claims_knowledge.md  # VA claims reference materials
├── routes/
│   └── health.js         # Health check route handler
├── server.js             # Main server file that starts the Express app
├── package.json          # Project dependencies and scripts
├── .env.example          # Environment variables template
└── README.md             # This file
```

## Prerequisites

- **Node.js** (version 14 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`

## Running Locally

### Step 1: Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install Express, OpenAI, Supabase, and other dependencies listed in `package.json`.

### Step 2: Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```bash
   # OpenAI Configuration (GPT-5.2 Responses API)
   OPENAI_API_KEY=sk-your-openai-key-here
   OPENAI_BASE_URL=  # Optional: for custom endpoints
   OPENAI_MODEL=gpt-5.2  # Default: gpt-5.2 (change to upgrade models)

   # Supabase Configuration
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

   # Application Configuration
   PORT=3000
   ```

**Note**: Get your OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys) and your Supabase credentials from your Supabase project settings.

### Step 3: Set Up Supabase Database

Create the following tables in your Supabase database:

**`memberships` table:**
```sql
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'canceled', 'past_due')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

**`ai_usage` table:**
```sql
CREATE TABLE ai_usage (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- Format: YYYY-MM
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, month)
);
```

### Step 4: Start the Server

Run the server with:

```bash
npm start
```

You should see:
```
✓ Supabase admin client initialized
✓ OpenAI client initialized
🚀 Server is running on port 3000
📍 Health check available at: http://localhost:3000/health
```

### Step 5: Test the Server

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Chat API (requires authentication):**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_TOKEN" \
  -d '{
    "messages": [
      {"role": "user", "content": "How do I file a VA claim?"}
    ]
  }'
```

## Running on Replit

### Step 1: Import the Project

1. Go to [Replit](https://replit.com/)
2. Click "Create Repl"
3. Choose "Import from GitHub" or upload your project files
4. Select "Node.js" as the template

### Step 2: Set Up Secrets (Environment Variables)

1. Click on the "Secrets" tab in Replit (lock icon in the left sidebar)
2. Add the following secrets:
   - `AI_INTEGRATIONS_OPENAI_API_KEY` - Your OpenAI API key
   - `OPENAI_MODEL` - Model to use (e.g., `gpt-4o-mini`)
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `PORT` - Optional (Replit sets this automatically)

**Note**: In Replit, environment variables are stored as "Secrets" and are automatically loaded.

### Step 3: Install Dependencies

In the Replit shell, run:

```bash
npm install
```

### Step 4: Set Up Supabase Database

Follow the same database setup as in "Running Locally" Step 3. You can run the SQL commands in your Supabase SQL Editor.

### Step 5: Run the Server

Click the "Run" button in Replit, or type in the shell:

```bash
npm start
```

### Step 6: Access Your Server

- Replit will automatically provide a URL (e.g., `https://your-project.repl.co`)
- Test the health endpoint: `https://your-project.repl.co/health`
- The chat API will be available at: `https://your-project.repl.co/api/chat`

**Note**: 
- Replit automatically sets the `PORT` environment variable
- Make sure your Supabase project allows connections from Replit's IP addresses
- For production, consider using Replit's database or a managed database service

## Available Routes

- `GET /health` - Check if the server is running
- `POST /api/chat` - AI Claims Assistant chat endpoint (requires authentication)

## Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
# OpenAI Configuration (GPT-5.2 Responses API)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=  # Optional: custom endpoint for OpenAI-compatible APIs
OPENAI_MODEL=gpt-5.2  # Default: gpt-5.2 (supports any model via Responses API)

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Application Configuration
PORT=3000  # Optional
APP_URL=http://localhost:3000  # Optional
```

**Important**: Never commit your `.env` file to version control. It's already in `.gitignore`.

## API Documentation

### POST /api/chat

Chat with the AI Claims Assistant.

**Authentication**: Required (Bearer token in Authorization header)

**Request Body**:
```json
{
  "messages": [
    { "role": "user", "content": "How do I file a VA claim?" }
  ],
  "retrievedContext": "optional RAG context"
}
```

**Response**:
```json
{
  "message": "AI response text...",
  "usage": {
    "count": 3,
    "limit": 5,
    "remaining": 2,
    "isMember": false
  }
}
```

**Usage Limits**:
- Free users: 5 messages per month
- Members: 200 messages per month

**Error Responses**:
- `401` - Authentication required
- `429` - Usage limit reached
- `500` - Server error

## Prompt Architecture

The AI prompt system is organized into modular components for maintainability and clarity.

### Structure

The prompts are organized in `/src/prompts/`:

- **`system.js`** - Core identity, mission, and hard guardrails (fraud prevention, medical/legal boundaries, crisis protocol)
- **`developer.js`** - Response structure, formatting rules, and reasoning processes
- **`tier.js`** - Different response depths for free users vs members
- **`voice.js`** - Brand voice, tone, and communication style
- **`templates.js`** - Behavioral templates for membership gating, usage limits, and common intents
- **`index.js`** - Main composition module that exports `buildPrompt()`

### Knowledge Base

VA claims knowledge is stored in `/src/knowledge/va_claims_knowledge.md`. This is **not injected by default** - it should be retrieved and passed as `retrievedContext` when relevant.

### Usage

```javascript
const { buildPrompt } = require('./src/prompts');

// For a free user
const freeUserPrompt = buildPrompt({ isMember: false });

// For a member
const memberPrompt = buildPrompt({ isMember: true });

// With retrieved knowledge context (RAG)
const promptWithContext = buildPrompt({
  isMember: true,
  retrievedContext: 'Relevant knowledge excerpt from va_claims_knowledge.md...'
});
```

### How It Works

1. **Composition**: `buildPrompt()` combines all prompt components in the correct order
2. **Tier Selection**: Automatically selects free or member tier based on `isMember` flag
3. **Context Injection**: Optionally appends retrieved knowledge when provided
4. **Maintainability**: Each component is in its own file with clear comments

### Modifying Prompts

- Edit individual files in `/src/prompts/` to update specific aspects
- Changes to `system.js` affect core guardrails and safety rules
- Changes to `tier.js` affect response depth for free vs member users
- Changes to `voice.js` affect tone and brand personality

## Next Steps

- Add more routes for handling veteran disability claim data
- Connect to a database to store information
- Add authentication for secure access
- Create API endpoints for specific features
- Implement RAG (Retrieval Augmented Generation) to inject knowledge context

## Troubleshooting

**Port already in use?**
- Change the port in `server.js`: `const PORT = 3001;` (or any available port)

**Module not found errors?**
- Make sure you ran `npm install` in the project directory

**Server not starting?**
- Check that Node.js is installed: `node --version`
- Verify you're in the correct directory with `package.json`
