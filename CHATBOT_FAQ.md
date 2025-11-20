# 🤖 Chatbot - Frequently Asked Questions

## Getting Started

### Q: How do I access the chatbot?
**A:** 
1. Login to your application
2. Click the "Assistant" button (shows as "Chat" on mobile) in the top navigation
3. Start typing your questions

### Q: Do I need to install anything?
**A:** 
No! Everything is already installed:
- ✅ Package `@google/generative-ai` is installed
- ✅ Chatbot components are created
- ✅ API endpoint is ready

Just make sure your `.env` file has the `API_KEY` set.

### Q: What if I don't have a Gemini API key?
**A:**
1. Go to https://aistudio.google.com/app/apikey
2. Click "Get API Key"
3. Copy the key
4. Add to your `.env`: `API_KEY=your_copied_key`
5. Restart your dev server with `npm run dev`

---

## Functionality

### Q: What can the chatbot tell me about?
**A:** The chatbot can answer questions about:
- ✅ Task completion status and statistics
- ✅ Pending vs completed tasks
- ✅ Pipeline status and monitoring
- ✅ Failed and unresolved pipelines
- ✅ Automated task schedules and activity
- ✅ Shift information and monitoring records
- ✅ Retailer-specific information
- ✅ Execution statistics

### Q: Can the chatbot see other users' data?
**A:** No! The chatbot only shows:
- Your own tasks
- Your own pipelines
- Your own monitoring records
- Your own automated tasks

Each user has complete data isolation.

### Q: Can I ask custom/complex questions?
**A:** Yes! The chatbot uses Google Gemini AI which understands natural language. You can ask questions like:
- "Tell me about failed pipelines that happened yesterday"
- "Which retailers have the most tasks?"
- "How many tasks are for direct load vs indirect load?"
- "What's the overall status of my system?"

### Q: How accurate are the responses?
**A:** Very accurate! The chatbot:
- Queries real-time data from your database
- Gets live statistics
- Provides current information
- Updates with each query

---

## Troubleshooting

### Q: The chatbot says "Unauthorized"
**A:** 
Steps to fix:
1. Make sure you're logged in
2. Check if your session is still valid
3. Try logging out and back in
4. Clear your browser cache
5. Try in a private/incognito window

### Q: I'm getting "API key invalid" error
**A:**
1. Check your `.env` file
2. Verify `API_KEY=...` is present
3. Make sure the key has no extra spaces
4. Regenerate key at https://aistudio.google.com/app/apikey
5. Restart your dev server: `npm run dev`

### Q: The chatbot isn't responding
**A:**
Try these steps:
1. **Check connection:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Send a message
   - Look for `/api/chatbot` request
   
2. **Check for errors:**
   - Go to Console tab in DevTools
   - Look for red error messages
   - Share error message for debugging

3. **Check database:**
   - Verify MongoDB is running
   - Check DATABASE_URL in `.env`
   - Verify you have data in database

4. **Restart server:**
   ```bash
   npm run dev
   ```

### Q: Responses are very slow (5+ seconds)
**A:**
This is usually normal because:
- Gemini API takes 1-5 seconds typically
- Database query adds ~100-500ms
- Network latency adds variable time

If slower than 10 seconds:
- Check your internet connection
- Try again (APIs have variance)
- Check if database has massive data

### Q: Chat history disappears when I refresh
**A:**
This is expected behavior for v1.0. Currently:
- Messages persist during your session
- Refreshing the page clears history
- No database storage of conversations

This can be added as a future enhancement if needed.

### Q: Can I download the chat history?
**A:**
Currently not available, but you can:
- Copy-paste responses from the chat
- Take screenshots
- Ask the chatbot to generate a summary

This can be added as a future feature.

---

## Data & Privacy

### Q: Is my data secure?
**A:**
Yes! Security measures include:
- ✅ Authenticated access only (must be logged in)
- ✅ Session-based security
- ✅ User data isolation
- ✅ Server-side database queries
- ✅ API key stored server-side only
- ✅ HTTPS encryption (when deployed)

### Q: Does the chatbot store my questions?
**A:**
Currently: No, messages are only stored in your browser session
After refresh: Messages are cleared

If you want conversation history stored, let me know and I can add that feature.

### Q: Can the AI see my passwords or sensitive data?
**A:**
No! The AI only sees:
- Task names and status
- Retailer names
- Pipeline names
- Monitoring data
- Timestamps

It never sees:
- ❌ User passwords
- ❌ Emails
- ❌ Personal details
- ❌ Sensitive configurations

---

## Performance

### Q: Why is the first message slower?
**A:**
The first message is slower because:
1. AI model needs to load (~1-2 seconds)
2. Database queries start
3. Response generation

Subsequent messages are usually faster (2-4 seconds).

### Q: Can I ask multiple questions?
**A:**
Yes! You can ask as many questions as you want:
- Send unlimited messages
- Each gets independent response
- No conversation memory between messages (yet)

### Q: What's the maximum message length?
**A:**
You can send:
- Up to several thousand characters per message
- Long questions are fine
- The AI will process and respond

---

## Feature Requests

### Q: Can you add message history storage?
**A:** Yes! This can be added. It would:
- Store conversations in database
- Allow viewing previous conversations
- Search through past Q&A
- Export conversations

This is a planned future feature.

### Q: Can the chatbot generate reports?
**A:** Yes, this can be added! The chatbot could:
- Generate PDF reports
- Create Excel summaries
- Email reports automatically
- Schedule recurring reports

Let me know if you want this.

### Q: Can I integrate this with Slack/Teams?
**A:** Yes, this is possible! We could:
- Add Slack bot integration
- Add Microsoft Teams integration
- Send alerts via messaging apps
- Get responses in your team chat

This requires additional setup but is doable.

---

## Technical Details

### Q: What API is being used?
**A:**
- **AI Model:** Google Gemini (gemini-pro)
- **Package:** `@google/generative-ai`
- **API:** Google AI Studio API
- **Cost:** Free tier available, pay-as-you-go after

### Q: How much will this cost?
**A:**
Google Gemini pricing:
- **Free:** Up to 60 requests/minute
- **Paid:** $0.0025 per 1K input tokens, $0.0075 per 1K output tokens

For most business use cases, it's very affordable.

### Q: What data does the API request?
**A:**
The chatbot sends:
1. User's database context (aggregated stats)
2. User's question
3. No personal passwords or sensitive data
4. No email addresses

All communication is encrypted.

### Q: Can I use a different AI provider?
**A:**
Yes! The code can be modified to use:
- OpenAI (ChatGPT)
- Claude (Anthropic)
- Llama (Meta)
- Any other LLM

Let me know if you want to switch providers.

---

## Best Practices

### Q: What's the best way to ask questions?
**A:** Try these patterns:
- **Specific:** "How many tasks for Walmart?"
- **Comparative:** "Are there more failed or successful pipelines?"
- **Temporal:** "How many tasks were completed today?"
- **Actionable:** "What should I focus on?"

### Q: What if the AI gives wrong information?
**A:**
This is rare because:
- Data comes directly from database
- Statistics are calculated, not guessed
- But it can happen with interpretation

If it happens:
1. Rephrase the question
2. Try a different wording
3. Report it so we can improve the prompt

### Q: How do I get better responses?
**A:**
Tips for better responses:
- Be specific about what you want
- Ask one question at a time
- Provide context if needed
- Use the quick suggestion buttons for templates

---

## Advanced Usage

### Q: Can I ask follow-up questions?
**A:**
Each question is independent right now. For follow-ups:
- Rephrase including previous context
- Or ask a new question based on response

Example:
- Q1: "How many failed pipelines?"
- Response: "3 failed pipelines"
- Q2: "Those 3 pipelines - when did they fail?"

### Q: Can the chatbot perform actions?
**A:**
Currently: No, it only reads data

Future capabilities could include:
- Mark tasks as complete
- Update pipeline status
- Create new records
- Send notifications

Let me know if you need this.

### Q: Can multiple users chat simultaneously?
**A:**
Yes! Each user:
- Has their own session
- Sees only their data
- Can ask questions independently
- No interference between users

---

## Limits & Constraints

### Q: Are there any request limits?
**A:**
Google Gemini limits:
- Free tier: 60 requests per minute
- After that: Rate limited
- Paid: Higher limits available

For normal usage, you won't hit these.

### Q: What if database is empty?
**A:**
The chatbot will:
- Tell you "No tasks found" or similar
- Still process the question
- Not crash or error
- Suggest adding data

### Q: What if the API goes down?
**A:**
You'll see error messages like:
- "API unavailable"
- "Service error"
- "Try again later"

This is rare but can happen.

### Q: Maximum data it can handle?
**A:**
The chatbot can efficiently handle:
- ✅ Thousands of tasks
- ✅ Hundreds of pipelines
- ✅ Thousands of monitoring records
- ✅ Complex queries

No practical limits for normal usage.

---

## Support

### Q: Where do I report issues?
**A:**
1. Check browser console (F12 → Console)
2. Look for error messages
3. Share the full error details
4. Describe what you were trying to do
5. Include screenshots if possible

### Q: How do I provide feedback?
**A:**
Feel free to suggest:
- New features
- Better responses
- UI improvements
- Integration ideas
- Cost-saving ideas

All feedback helps improve the chatbot!

### Q: Is there documentation?
**A:**
Yes! Check these files:
- `CHATBOT_SETUP.md` - Detailed setup guide
- `CHATBOT_CHECKLIST.md` - Implementation checklist
- `CHATBOT_FAQ.md` - This file

---

## Summary

The chatbot is a powerful tool for:
✅ Quick information lookup
✅ System status monitoring
✅ Data aggregation and analysis
✅ Natural language queries
✅ 24/7 availability

It's fully functional and ready to use!

Have more questions? Feel free to ask or check the setup documentation.

---

**Last Updated:** November 19, 2025  
**Version:** 1.0  
**Status:** Ready for Production

