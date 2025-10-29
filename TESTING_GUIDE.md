# Important Pipelines Feature - Testing Guide

## Server Status
✅ **Dev Server Running**: http://localhost:3001

---

## Testing Steps

### Step 1: Login
1. Open http://localhost:3001
2. Navigate to Login page
3. Enter your credentials (or register if needed)
4. Click Login

---

### Step 2: Access Important Pipelines
1. From dashboard, click on **Important Pipelines** in the menu
2. You should see two tabs:
   - **Monitoring Records** (default)
   - **Master Pipelines**

---

### Step 3: Add Master Pipelines (Setup)
1. Click the **Master Pipelines** tab
2. You should see an **Add Pipeline** button
3. Click it and add test pipelines:
   ```
   Pipeline 1:
   - Name: ETL_Daily_Pipeline
   - Trigger: Schedule
   - Description: Daily ETL process
   
   Pipeline 2:
   - Name: Data_Validation_Pipeline
   - Trigger: Dependent
   - Description: Post-ETL validation
   
   Pipeline 3:
   - Name: Reporting_Pipeline
   - Trigger: Manual
   - Description: Daily reports generation
   ```
4. You should see each pipeline added to the list
5. Try editing and deleting a pipeline to verify functionality

---

### Step 4: Create Shift Records (Main Feature Test)
1. Go back to **Monitoring Records** tab
2. You should see:
   - Empty table with message "No monitoring records"
   - Search box
   - **Create Shift Records** button (top right)
3. Click **Create Shift Records** button
4. A dialog should appear with:
   - "Select Shift" dropdown
   - Three options:
     - A Shift (6:30 AM - 3:00 PM IST)
     - B Shift (2:20 PM - 11:00 PM IST)
     - C Shift (10:30 PM - 7:00 AM IST)

**Expected Result** ✅:
- Select "A Shift"
- Click "Create Records"
- Should see success toast: "3 records created for A shift"
- Table should now show 3 rows (one for each pipeline)

---

### Step 5: Verify Table Display
Once records are created, verify:

**Column Visibility** ✓
- [ ] Monitoring Date (today's date)
- [ ] Shift IST (should show "A")
- [ ] ADF Pipeline Name (ETL_Daily_Pipeline, etc.)
- [ ] ADF Trigger Name (empty - to be filled)
- [ ] ADF Pipeline Run ID (empty - to be filled)
- [ ] Duration (empty - to be filled)
- [ ] Execution Status (empty - no color badge yet)
- [ ] Monitored By (empty - to be filled)
- [ ] If Failed - Re-run ID (empty)
- [ ] SNOW Incident # (empty)
- [ ] Failure Handled (empty)
- [ ] Post Resolve Data Load (empty)
- [ ] Comments (empty)
- [ ] Actions column (Edit button visible)

**Pagination** ✓
- [ ] Show correct record count
- [ ] Navigation buttons at bottom

---

### Step 6: Edit a Record (Main Interaction)
1. Find the first pipeline record
2. Click the **Edit** button (pencil icon)
3. A dialog should open with the form
4. Fill in the details:
   ```
   Trigger Name: Schedule Trigger
   Pipeline Run ID: run_20251027_001
   Duration: 02:30:45
   Execution Status: SUCCESS (dropdown)
   Monitored By: John Doe
   Re-run ID: (leave empty)
   SNOW Incident: (leave empty)
   Failure Handled: YES
   Data Load Check: YES
   Comments: Pipeline executed successfully
   ```
5. Click **Save Changes**

**Expected Results** ✅:
- Dialog closes
- Toast shows: "Record updated successfully"
- Table refreshes with updated data
- Execution Status shows with green color badge (SUCCESS)

---

### Step 7: Test Failed Pipeline (Incident Scenario)
1. Edit another record and set:
   ```
   Execution Status: FAILED
   If Failed - Re-run ID: rerun_20251027_001
   SNOW Incident #: INC0001234567
   Failure Handled: NO
   Data Load Check: NO
   Comments: Pipeline failed due to DB connection timeout
   ```
2. Save the record

**Expected Results** ✅:
- Record shows FAILED status with red color badge
- All incident details are visible in the table

---

### Step 8: Test Search & Filter
1. In the search box, type "SUCCESS"
2. Table should filter to show only successful records

**Test variations** ✓:
- [ ] Search by pipeline name: "ETL_Daily"
- [ ] Search by incident number: "INC0001234567"
- [ ] Search by duration: "02:30"
- [ ] Search by "John Doe"
- [ ] Clear search and verify all records return

---

### Step 9: Test Sorting
1. Click on column headers to sort:
   - [ ] Monitoring Date (ascending/descending)
   - [ ] Shift IST (A, B, C order)
   - [ ] Pipeline Name (alphabetical)
   - [ ] Execution Status (colored badges sort)
   - [ ] Any text column

**Expected Results** ✅:
- Column header shows up/down arrow indicator
- Rows reorder based on selection

---

### Step 10: Test Duplicate Prevention
1. Click **Create Shift Records** again
2. Select "A Shift" again
3. Click **Create Records**

**Expected Results** ✅:
- Toast shows: "0 records created for A shift (3 already exist)"
- No duplicate records added
- Existing records remain unchanged

---

### Step 11: Test Different Shifts
1. Click **Create Shift Records**
2. Select "B Shift"
3. Click **Create Records**

**Expected Results** ✅:
- Toast shows: "3 records created for B shift"
- Table now shows 6 records (3 from A shift, 3 from B shift)
- B shift records have Shift IST = "B"
- Same pipeline names appear in both shifts

---

### Step 12: Test Status Color Coding
Verify all status colors display correctly:

| Status | Color | Expected |
|--------|-------|----------|
| SUCCESS | Green badge | ✅ bg-green-100 text-green-800 |
| FAILED | Red badge | ✅ bg-red-100 text-red-800 |
| RUNNING | Yellow badge | ✅ bg-yellow-100 text-yellow-800 |
| PENDING | Blue badge | ✅ bg-blue-100 text-blue-800 |
| NOT_STARTED | Gray badge | ✅ bg-gray-100 text-gray-800 |

---

### Step 13: Test Pagination
1. If you have more than 10 records, pagination should work:
   - [ ] "Previous" button disabled on first page
   - [ ] "Next" button visible
   - [ ] Click "Next" shows next 10 records
   - [ ] "Previous" button becomes enabled
   - [ ] Record count shows: "Showing 1 to 10 of X"

---

### Step 14: Test Textarea Comments
1. Edit a record
2. In Comments field, enter a longer text:
   ```
   This is a detailed comment about the pipeline execution.
   It includes multiple lines and detailed information about
   what happened during the pipeline run.
   ```
3. Save the record
4. Verify comment is truncated in the table but visible on hover (title attribute)
5. Edit again to verify full comment is displayed in dialog

---

### Step 15: Test Responsive Design
1. Open browser DevTools (F12)
2. Test on different screen sizes:
   - [ ] Desktop (1920px): All columns visible
   - [ ] Tablet (768px): Horizontal scroll for table
   - [ ] Mobile (375px): Stack view with scroll

---

## Error Scenarios to Test

### Scenario 1: No Pipelines Added
1. Logout and login with a new account (no pipelines)
2. Go to Important Pipelines → Monitoring Records
3. Click **Create Shift Records**

**Expected** ❌:
- Error toast: "No pipelines found. Please add pipelines first."
- Dialog closes without creating records

### Scenario 2: Network Error (Simulate)
1. Open DevTools Network tab
2. Set "Offline" mode
3. Try to save a record
4. Try to create shift records

**Expected** ❌:
- Error toast appears
- Operation fails gracefully
- No corrupted data

### Scenario 3: Missing Required Data
1. Edit a record but leave all fields empty
2. Click Save

**Expected** 🔄:
- Record should still save (all fields are optional)
- Or show validation error if implemented

---

## Performance Testing

### Load Testing
1. Create 100+ monitoring records manually or via API
2. Verify:
   - [ ] Table loads quickly
   - [ ] Search responds in <500ms
   - [ ] Sorting works smoothly
   - [ ] Pagination handles large datasets

### Database Queries
Check browser Network tab when:
- [ ] Loading Monitoring Records page
- [ ] Searching/filtering
- [ ] Sorting
- [ ] Pagination

**Expected**: Each API call should be fast (<200ms)

---

## API Endpoint Testing (Advanced)

### Test GET Endpoint
```bash
curl "http://localhost:3001/api/pipeline-monitoring-records"
```

**Expected**: Array of records in JSON

### Test POST Endpoint
```bash
curl -X POST "http://localhost:3001/api/pipeline-monitoring-records" \
  -H "Content-Type: application/json" \
  -d '{
    "monitoringDate": "2025-10-27",
    "shiftIST": "A",
    "adfPipelineName": "Test_Pipeline",
    "overallExecutionStatus": "SUCCESS"
  }'
```

**Expected**: 201 Created with record data

### Test PUT Endpoint
```bash
curl -X PUT "http://localhost:3001/api/pipeline-monitoring-records/[record-id]" \
  -H "Content-Type: application/json" \
  -d '{
    "overallExecutionStatus": "FAILED",
    "snowIncidentNumber": "INC0001234567"
  }'
```

**Expected**: 200 OK with updated record

---

## Checklist Summary

### Core Functionality ✅
- [ ] Add master pipelines
- [ ] Create shift records automatically
- [ ] Edit individual records
- [ ] View all 14 columns
- [ ] Status badges with correct colors
- [ ] Search and filter
- [ ] Sort by column
- [ ] Pagination

### Edge Cases ✅
- [ ] No pipelines scenario
- [ ] Duplicate prevention
- [ ] Different shifts (A, B, C)
- [ ] Long text in comments
- [ ] Empty fields

### UI/UX ✅
- [ ] Responsive design
- [ ] Toast notifications
- [ ] Loading states
- [ ] Error messages
- [ ] Button states (disabled/enabled)

### Performance ✅
- [ ] Fast page load
- [ ] Smooth search
- [ ] Quick sorting
- [ ] Responsive pagination

---

## Success Criteria

✅ **All tests pass** = Feature is ready for production

- All CRUD operations work
- No errors in console
- All UI elements display correctly
- Search and sort work smoothly
- Status colors display properly
- Duplicate prevention works
- All toasts show correct messages
- Responsive on all device sizes

---

## Next Steps After Testing

1. ✅ Feature working → Commit changes
2. ✅ Deploy to staging
3. ✅ Get user feedback
4. ✅ Deploy to production

---

**Testing Date**: October 27, 2025
**Server**: http://localhost:3001
**Ready to test**: YES ✅
