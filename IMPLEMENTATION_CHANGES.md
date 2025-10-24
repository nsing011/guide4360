# Pipeline Monitoring - Status Resolution Implementation

## Overview
This document describes the changes made to enable pipeline teams to mark pipelines as "RESOLVED" when they have successfully repaired an unresolved or pending pipeline.

---

## Changes Made

### 1. **Prisma Schema Update** (`prisma/schema.prisma`)
- **Change**: Updated the `currentStatus` field documentation to use "UNRESOLVED" instead of "FAILED_AGAIN"
- **Line 124**: `currentStatus String? // Status after re-run: "RESOLVED", "UNRESOLVED", "PENDING"`
- **Impact**: Clarifies the three possible states for pipeline monitoring status
  - `RESOLVED`: Pipeline issue has been successfully resolved
  - `UNRESOLVED`: Pipeline issue remains unresolved
  - `PENDING`: Pipeline issue is pending resolution

### 2. **API Route Enhancement** (`app/api/pipeline-monitoring/route.ts`)
- **New Endpoint**: Added `PUT` handler to update monitoring record status
- **Features**:
  - Accepts `id` and `currentStatus` in request body
  - Validates user authentication before allowing updates
  - Verifies record ownership (user can only update their own records)
  - Supports status updates to: RESOLVED, UNRESOLVED, or PENDING
  - Updates the `updatedAt` timestamp automatically
  
- **Endpoint**: `PUT /api/pipeline-monitoring`
- **Request Body**:
  ```json
  {
    "id": "record-id-here",
    "currentStatus": "RESOLVED"
  }
  ```
- **Response**: Updated monitoring record object
- **Error Handling**:
  - 401: Unauthorized (not logged in)
  - 400: Invalid input (missing id, invalid status)
  - 404: Record not found
  - 500: Server error

### 3. **Monitoring Dashboard UI Updates** (`components/monitoring-dashboard.tsx`)

#### A. Status Color Mapping Update
- Changed `FAILED_AGAIN` to `UNRESOLVED` in the `currentStatusColorMap`
- `UNRESOLVED`: Red background (bg-red-100 text-red-800) - indicates unresolved issue

#### B. New State Management
- Added `updatingId` state to track which record is being updated
- Prevents multiple simultaneous update requests

#### C. New Handler Function
- `handleMarkAsResolved(id: string)`: 
  - Makes a PUT request to update the pipeline status to RESOLVED
  - Shows success/error toast notifications
  - Automatically revalidates the data to reflect changes
  - Handles loading states

#### D. New Actions Column
- Added a new "Actions" column to the monitoring table
- **Logic**:
  - If status is `UNRESOLVED` or `PENDING`: Shows a "Resolved" button with a checkmark icon
  - If status is `RESOLVED`: Shows a read-only "✓ Resolved" text
  - If no status exists: Shows "N/A"
  
- **Button Features**:
  - Green default button with CheckCircle2 icon
  - Disabled state while updating
  - Shows "Updating..." text during request
  - Triggers data refresh on successful update

#### E. Import Updates
- Added `CheckCircle2` icon from lucide-react for the resolved button

---

## User Workflow

### Scenario: Pipeline Repair and Resolution

1. **Initial State**: A pipeline fails and is marked as `UNRESOLVED`
   - Monitored by engineering team
   - Status shows as "UNRESOLVED" (red badge)

2. **Repair Phase**: Team works on fixing the issue
   - Investigation and fixes are performed
   - Comments and working team information are updated

3. **Resolution**: Once fixed, team clicks the "Resolved" button
   - Button is visible only for UNRESOLVED or PENDING records
   - Status is updated to RESOLVED
   - Success message is displayed
   - Table refreshes to show the updated status
   - Button changes to "✓ Resolved" (read-only state)

---

## Technical Details

### Status Management
- **RESOLVED**: Pipeline issue has been fixed and is no longer a concern
- **UNRESOLVED**: Pipeline issue exists and requires attention
- **PENDING**: Pipeline issue is awaiting resolution or reassessment

### Automatic Updates
- The monitoring dashboard automatically refreshes every 30 seconds (configurable via `refreshInterval`)
- Users can also manually trigger updates through actions
- All timestamp updates are automatic on the backend

### Data Persistence
- Changes are persisted to PostgreSQL database
- `updatedAt` field is automatically set to current timestamp
- User association ensures data isolation and security

---

## UI/UX Improvements

1. **Clear Status Indicators**: Color-coded status badges
   - Green = Resolved (safe)
   - Red = Unresolved (needs attention)
   - Yellow = Pending (in progress)

2. **One-Click Resolution**: Resolve status without opening a modal
   - Quick action button in the table
   - Immediate feedback with toast notifications

3. **Visual Feedback**: 
   - Button disabled state during update
   - Loading text ("Updating...")
   - Success/error toast messages

4. **Read-Only Resolved Records**: Once resolved, shows checkmark instead of button
   - Prevents accidental re-updates
   - Clear indication of final status

---

## Testing Checklist

- [ ] Create a new monitoring record with UNRESOLVED status
- [ ] Verify the record appears in the monitoring table
- [ ] Click the "Resolved" button on an UNRESOLVED record
- [ ] Verify the button shows "Updating..." during the request
- [ ] Verify success toast notification appears
- [ ] Verify the status changes to "RESOLVED" (green badge)
- [ ] Verify the button changes to "✓ Resolved" text
- [ ] Create another record with PENDING status
- [ ] Verify the "Resolved" button appears and works
- [ ] Verify the API rejects invalid status values
- [ ] Verify unauthorized users cannot update records
- [ ] Verify users can only update their own records

---

## Files Modified

1. `prisma/schema.prisma` - Schema documentation update
2. `app/api/pipeline-monitoring/route.ts` - Added PUT handler
3. `components/monitoring-dashboard.tsx` - Added UI for status updates

---

## Future Enhancements

1. Add bulk status update functionality
2. Add filters to show only UNRESOLVED/PENDING records
3. Add status change history/audit log
4. Add email notifications when pipelines are resolved
5. Add dashboard analytics for resolution time tracking
6. Add custom status reasons when marking as resolved
