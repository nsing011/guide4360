# Chatbot Feature Setup & Documentation

## Overview
A conversational AI assistant has been integrated into your Retailer Management System. The chatbot uses Google Gemini AI to answer questions about tasks, automated tasks, pipelines, and monitoring records directly from your database.

## What Was Added

### 1. **API Endpoint** (`/app/api/chatbot/route.ts`)
- Handles POST requests with user messages
- Fetches relevant data from the database (tasks, pipelines, monitoring records, automated tasks)
- Sends context and user query to Google Gemini
- Returns AI-generated response

### 2. **Chatbot Component** (`/components/chatbot.tsx`)
- Beautiful chat interface with message history
- Real-time message updates
- Auto-scroll to latest messages
- Quick suggestion buttons for common queries
- Loading states and error handling

### 3. **Chatbot Page** (`/app/chatbot/page.tsx`)
- New route at `/chatbot`
- Server-side rendered with metadata

### 4. **Navigation Integration**
- Added "Assistant" button to task dashboard navigation
- Accessible from any dashboard page

## Configuration Required

### ✅ Already Done
- `@google/generative-ai` package installed
- `API_KEY` added to `.env` file (Gemini API key)

### Environment Variables
Make sure your `.env` file contains:
```
API_KEY=your_gemini_api_key_here
DATABASE_URL=your_mongodb_connection_string
```

**To get a Gemini API key:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key or use existing one
4. Copy and paste in `.env` as `API_KEY=your_key`

## Database Requirements

### No Database Schema Changes Needed ✅
The chatbot works with your existing database structure:
- **Tasks** - Queries completion status, retailer info, load type
- **Automated Tasks** - Status, activity, last run time
- **Pipelines** - Names, trigger names, active status
- **Pipeline Monitoring** - Status (SUCCESS/FAILED), current status (RESOLVED/UNRESOLVED/IN-PROGRESS)
- **Pipeline Monitoring Records** - Execution status, shift info, ADF pipeline names

## How It Works

### Data Collection
When a user sends a message, the chatbot:
1. **Fetches all relevant user data** from the database (async queries)
2. **Aggregates statistics** (e.g., total tasks, completed tasks, failed pipelines)
3. **Creates a context prompt** with all available information
4. **Sends to Gemini** along with the user's question
5. **Returns the AI response** back to the frontend

### Example Queries the Chatbot Can Answer:
- "How many tasks are completed?"
- "What's the status of my pipelines?"
- "How many unresolved pipelines do I have?"
- "Tell me about automated tasks"
- "Which pipelines have failed?"
- "How many tasks are pending?"
- "What's the status of pipeline monitoring?"
- "Show me task details for [retailer name]"
- "How many pipelines are active?"
- "When was the last automated task run?"

## Features

### ✨ Highlights
1. **Real-time Database Context** - AI has access to latest data
2. **User-Specific Data** - Each user sees only their own data
3. **Beautiful UI** - Modern chat interface with smooth scrolling
4. **Quick Suggestions** - Pre-built common queries
5. **Error Handling** - Graceful error messages and debugging
6. **Responsive Design** - Works on mobile, tablet, desktop
7. **Message History** - Persists during session
8. **Authentication** - Protected by existing auth system

## Usage

### Access the Chatbot
1. Login to your app
2. Click "Assistant" or "Chat" button in navigation
3. Start asking questions about your data
4. Use quick suggestion buttons or type custom queries

### Example Workflow
```
User: "How many tasks are completed?"
AI: "You have 25 completed tasks out of 50 total tasks. 
     The completed tasks include Walmart, Amazon, and 
     London Drugs with various load types."

User: "What about unresolved pipelines?"
AI: "You have 3 unresolved pipelines:
     1. tpl_inventory_check - Status: FAILED
     2. tpl_data_sync - Status: IN-PROGRESS
     3. tpl_report_gen - Status: FAILED"
```

## API Details

### Request Format
```typescript
POST /api/chatbot
Content-Type: application/json

{
  "message": "How many tasks are completed?"
}
```

### Response Format
```typescript
{
  "response": "You have 25 completed tasks...",
  "timestamp": "2025-11-19T13:35:09.525Z"
}
```

### Response Codes
- `200` - Success
- `400` - Missing or invalid message
- `401` - Unauthorized (not logged in)
- `500` - Server error (check API key, database connection)

## Data Aggregations Available to AI

### Tasks Summary
- Total tasks count
- Completed vs pending tasks
- Task details: retailer, day, load type, status

### Automated Tasks Summary
- Total automated tasks
- Active vs inactive
- Last run timestamps
- Task types

### Pipelines Summary
- Total pipelines
- Active pipelines
- Pipeline names and trigger names

### Pipeline Monitoring Summary
- Failed pipelines count
- Successful pipelines count
- Running pipelines count
- Unresolved pipelines count
- Recent monitoring records

### Pipeline Records Summary
- Success/failure/running execution counts
- Shift information (A/B/C)
- ADF pipeline execution details

## Troubleshooting

### "Invalid API key" Error
- Check `.env` file has `API_KEY` set
- Verify API key is correct from Google AI Studio
- Ensure no extra spaces or quotes

### "Unauthorized" Response
- Make sure you're logged in
- Check authentication session
- Try logout and login again

### Chatbot Not Responding
- Check browser console for errors
- Verify API endpoint is accessible
- Check database connection
- Ensure all users have proper roles

### Empty Database Responses
- Chatbot will work even with empty database
- It will inform user that specific data is unavailable
- Example: "No tasks found" instead of failing

## Performance Notes

### Query Optimization
- Uses `select()` to fetch only needed fields
- Limits monitoring records to 50 most recent
- Parallel queries for better performance
- Session-based data filtering

### Rate Limiting
- No built-in rate limiting (add if needed)
- Google Gemini API has its own rate limits
- Consider adding in production

## Future Enhancements

### Possible Additions:
1. **Message History Storage** - Save conversations to database
2. **Conversation Context** - Remember previous questions in same session
3. **Advanced Filters** - Ask for specific date ranges, retailers
4. **Report Generation** - Create PDF/Excel reports from insights
5. **Voice Input** - Speech-to-text for hands-free queries
6. **Custom Instructions** - Admin-defined rules for AI responses
7. **Analytics** - Track most asked questions
8. **Multi-language** - Support multiple languages

## File Structure
```
/app
  /api
    /chatbot
      route.ts          ← Main API endpoint
  /chatbot
    page.tsx            ← Chatbot page

/components
  chatbot.tsx           ← UI component

/lib
  auth.ts              ← Existing auth (used)
  prisma.ts            ← Database client (used)
```

## Testing

### Quick Test Steps:
1. Navigate to `/chatbot`
2. Ask: "How many tasks are completed?"
3. Should get response with task statistics
4. Click suggestion buttons to test
5. Check browser console for API logs

### Testing Different Scenarios:
- With no data in database
- With large amounts of data
- After creating new tasks/pipelines
- With different user accounts

## Security Notes

✅ **Implemented:**
- Session-based authentication required
- User data isolation (only their data shown)
- API key stored in environment variables
- Server-side database queries (client can't access DB directly)

⚠️ **Considerations:**
- API key should have limited permissions
- Consider adding rate limiting
- Monitor API usage and costs
- Regular security audits recommended

## Support

For issues or questions:
1. Check browser console for errors
2. Verify `.env` configuration
3. Test API endpoint directly with curl
4. Check database connectivity
5. Review error messages in server logs

---

**Last Updated:** November 19, 2025
**Chatbot Version:** 1.0
**Framework:** Next.js 14.2.16 + Gemini AI

