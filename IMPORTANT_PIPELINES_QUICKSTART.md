# Important Pipelines - Quick Start Guide

## Getting Started in 5 Minutes

### 1. Access the Feature
```
Menu > Important Pipelines
```

### 2. Set Up Your Master Pipelines (One-time Setup)
1. Click the **Master Pipelines** tab
2. Click **Add Pipeline** button
3. Enter your critical pipeline details:
   - Pipeline Name (required)
   - Trigger Name
   - Description
4. Click **Add**
5. Repeat for all critical pipelines you want to monitor

### 3. Create Your First Shift Records
1. Go back to **Monitoring Records** tab
2. Click **Create Shift Records** button
3. Select a shift:
   - **A Shift** (6:30 AM - 3:00 PM IST)
   - **B Shift** (2:20 PM - 11:00 PM IST)
   - **C Shift** (10:30 PM - 7:00 AM IST)
4. Click **Create Records**
5. Empty records will be created for each pipeline

### 4. Fill in Monitoring Details
1. Find the pipeline record in the table
2. Click the **Edit** button (pencil icon)
3. Fill in the execution details:
   ```
   ✓ Trigger Name          → e.g., "Schedule Trigger"
   ✓ Pipeline Run ID       → e.g., "abc123def456"
   ✓ Duration              → e.g., "02:30:45" (HH:MM:SS)
   ✓ Execution Status      → SUCCESS / FAILED / RUNNING / PENDING / NOT_STARTED
   ✓ Monitored By          → Your name
   ✓ If Failed - Re-run ID → e.g., "xyz789" (if failed)
   ✓ SNOW Incident #       → e.g., "INC0001234567" (if applicable)
   ✓ Failure Handled       → YES / NO / PARTIAL
   ✓ Data Load Check       → YES / NO / NOT_APPLICABLE
   ✓ Comments              → Any additional notes
   ```
4. Click **Save Changes**

### 5. Search and Filter Records
1. Use the search box to find records by:
   - Pipeline name
   - Date
   - Incident number
   - Any other detail
2. Click column headers to sort
3. Use Previous/Next buttons to paginate

## Common Tasks

### Task: Pipeline Failed - Track the Incident
1. Find the failed pipeline record
2. Click **Edit**
3. Fill in:
   - `Execution Status`: FAILED
   - `If Failed - Re-run ID`: Enter the re-run pipeline run ID
   - `SNOW Incident #`: Create ticket and enter incident number
   - `Failure Handled`: Select YES/NO/PARTIAL
   - `Comments`: Brief description of failure and resolution
4. Click **Save Changes**

### Task: Check Data After Resolution
1. Find the pipeline record with failed status
2. Click **Edit**
3. Update:
   - `Data Load Check`: YES (after verification)
   - `Comments`: Add confirmation of data validation
4. Click **Save Changes**

### Task: Next Shift Monitoring
1. At end of current shift OR beginning of next shift:
2. Click **Create Shift Records** button
3. Select the next shift
4. All pipelines will have new empty records for the next shift

### Task: Search for All Failed Pipelines in a Day
1. Use the search box and type "FAILED"
2. All records with failed status will appear
3. Review incidents and resolutions

### Task: Find Records for Specific Incident
1. Use search box and enter incident number: "INC0001234567"
2. All records related to that incident will appear

## Status Color Legend

| Color | Status | Meaning |
|-------|--------|---------|
| 🟢 Green | SUCCESS | Pipeline executed successfully |
| 🔴 Red | FAILED | Pipeline failed during execution |
| 🟡 Yellow | RUNNING | Pipeline is currently running |
| 🔵 Blue | PENDING | Pipeline is waiting to start |
| ⚪ Gray | NOT_STARTED | Pipeline hasn't started yet |

## Duration Format

Always use **HH:MM:SS** format:
- ✓ 02:30:45 (2 hours 30 minutes 45 seconds)
- ✓ 00:15:30 (15 minutes 30 seconds)
- ✓ 10:00:00 (10 hours)

## SNOW Incident Number Format

Use the full incident number format:
- ✓ INC0001234567
- ✓ INC1002968545

## Tips & Tricks

1. **Quick Entry**: Fill in "Monitored By" field once per shift - it helps track who was monitoring
2. **Comments**: Use comments for quick notes like "DB connection timeout" or "Memory issue"
3. **Incident Tracking**: Always enter SNOW incident number when reporting failures
4. **Data Validation**: Always check "Data Load Check" after resolving failures
5. **Shift Handoff**: At shift change, create new shift records immediately

## Troubleshooting

### Problem: "No pipelines found" error
**Solution**: Go to Master Pipelines tab and add pipelines first

### Problem: Can't create records for already created shift
**Solution**: This is expected. The system prevents duplicate records. Manually edit existing records instead

### Problem: Record not saving
**Solution**: Check that all required fields are filled (if showing validation error)

## Support

For questions or issues:
1. Check this guide again
2. Review the comprehensive documentation: `IMPORTANT_PIPELINES_IMPLEMENTATION.md`
3. Contact your team lead

## Keyboard Shortcuts

- Use **Tab** to navigate between form fields
- Use **Enter** to submit forms
- Use **Escape** to close dialogs

---

**Last Updated**: October 27, 2025
**Version**: 1.0
