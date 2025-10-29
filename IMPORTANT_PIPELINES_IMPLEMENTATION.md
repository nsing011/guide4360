# Important Pipelines Feature - Implementation Guide

## Overview
This document describes the new "Important Pipelines" workflow that allows teams to monitor critical pipelines across shifts and track their execution status and any incidents that occur.

## Feature Architecture

### Database Models

#### PipelineMonitoringRecord
```prisma
model PipelineMonitoringRecord {
  id                              String   @id @default(cuid())
  monitoringDate                  DateTime @default(now())
  shiftIST                        String   // "A", "B", or "C"
  adfPipelineName                 String
  adfTriggerName                  String?
  adfPipelineRunId                String?
  overallDurationHoursMins        String?
  overallExecutionStatus          String?  // SUCCESS, FAILED, RUNNING, PENDING, NOT_STARTED
  monitoredBy                     String?
  ifFailedAdfRerunId              String?
  snowIncidentNumber              String?  // SNOW ticket number
  failureHandled                  String?  // YES, NO, PARTIAL
  postResolveDataLoadChecked      String?  // YES, NO, NOT_APPLICABLE
  additionalComments              String?
  createdAt                       DateTime @default(now())
  updatedAt                       DateTime @updatedAt
  userId                          String
  user                            User     @relation("UserPipelineMonitoringRecords", fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([monitoringDate])
  @@index([shiftIST])
  @@unique([monitoringDate, shiftIST, adfPipelineName, userId])
}
```

### API Endpoints

#### 1. GET /api/pipeline-monitoring-records
**Purpose**: Fetch monitoring records with optional filtering

**Query Parameters**:
- `dateFrom`: ISO date string (optional)
- `dateTo`: ISO date string (optional)
- `shift`: A, B, or C (optional)

**Response**:
```json
[
  {
    "id": "record_id",
    "monitoringDate": "2025-10-27T00:00:00.000Z",
    "shiftIST": "A",
    "adfPipelineName": "Pipeline_Name",
    "adfTriggerName": "Trigger_Name",
    "adfPipelineRunId": "run_id",
    "overallDurationHoursMins": "02:30:45",
    "overallExecutionStatus": "SUCCESS",
    "monitoredBy": "John Doe",
    "ifFailedAdfRerunId": null,
    "snowIncidentNumber": null,
    "failureHandled": null,
    "postResolveDataLoadChecked": null,
    "additionalComments": null,
    "createdAt": "2025-10-27T10:00:00.000Z",
    "updatedAt": "2025-10-27T10:00:00.000Z"
  }
]
```

#### 2. POST /api/pipeline-monitoring-records
**Purpose**: Create a new monitoring record

**Request Body**:
```json
{
  "monitoringDate": "2025-10-27T00:00:00.000Z",
  "shiftIST": "A",
  "adfPipelineName": "Pipeline_Name",
  "adfTriggerName": "Trigger_Name",
  "adfPipelineRunId": "run_id",
  "overallDurationHoursMins": "02:30:45",
  "overallExecutionStatus": "SUCCESS",
  "monitoredBy": "John Doe",
  "additionalComments": "Pipeline ran successfully"
}
```

**Response**: 201 Created with the created record

#### 3. PUT /api/pipeline-monitoring-records/[id]
**Purpose**: Update an existing monitoring record

**Request Body**: Any field can be updated (all fields are optional)
```json
{
  "overallExecutionStatus": "FAILED",
  "ifFailedAdfRerunId": "rerun_123",
  "snowIncidentNumber": "INC0001234567",
  "failureHandled": "NO",
  "additionalComments": "Pipeline failed, investigating..."
}
```

**Response**: 200 OK with the updated record

#### 4. POST /api/pipeline-monitoring-records/create-shift
**Purpose**: Automatically create monitoring records for all pipelines in a selected shift

**Request Body**:
```json
{
  "shift": "A",
  "monitoringDate": "2025-10-27T00:00:00.000Z"
}
```

**Response**: 201 Created
```json
{
  "success": true,
  "message": "Created 10 monitoring records for A shift",
  "recordsCount": 10
}
```

**Notes**:
- Automatically fetches all unique pipelines added by the user
- Creates one record per pipeline
- Skips records that already exist for that date, shift, and pipeline combination

### UI Components

#### PipelineMonitoringRecordsDashboard
**Location**: `/components/pipeline-monitoring-records-dashboard.tsx`

**Features**:
1. **Monitoring Records Table**
   - 14 columns with all monitoring details
   - Sortable headers with visual indicators
   - Color-coded status badges:
     - SUCCESS: Green
     - FAILED: Red
     - RUNNING: Yellow
     - PENDING: Blue
     - NOT_STARTED: Gray
   - Searchable across all fields
   - Pagination (10 records per page)
   - Edit action button with pencil icon

2. **Edit Dialog**
   - Modal form to update all monitoring details
   - Disabled fields for pipeline name and shift (read-only)
   - Dropdown selects for status fields
   - Textarea for additional comments
   - Save/Cancel buttons with loading state

3. **Create Shift Records Dialog**
   - Shift selector (A, B, or C)
   - Displays shift IST timing
   - Creates empty records for all user's pipelines
   - Shows success toast with count of created records

### Workflow

#### Step 1: Add Master Pipelines
1. Navigate to **Important Pipelines** tab
2. Go to **Master Pipelines** tab
3. Add all critical pipelines to be monitored

#### Step 2: Create Shift Records
1. Navigate to **Monitoring Records** tab
2. Click **"Create Shift Records"** button
3. Select a shift (A, B, or C)
4. System automatically creates empty records for all master pipelines
5. Records are timestamped with current date

#### Step 3: Fill Monitoring Details
1. For each pipeline record in the shift:
   - Click the **Edit** button (pencil icon)
   - Fill in the execution details:
     - Trigger name
     - Pipeline Run ID
     - Duration (HH:MM:SS format)
     - Execution Status
     - Monitored by (name)
     - Re-run ID (if failed)
     - SNOW Incident Number (if applicable)
     - Failure Handled status
     - Post Resolve Data Load check status
     - Additional comments
2. Click **"Save Changes"** to persist

#### Step 4: Track and Report
- View all shift records in the main table
- Search and filter by pipeline name, date, shift, or any field
- Sort by any column for analysis
- Export or report on incident numbers and failure statuses

## Shift Timings (IST - Indian Standard Time)

- **A Shift**: 6:30 AM - 3:00 PM IST
- **B Shift**: 2:20 PM - 11:00 PM IST
- **C Shift**: 10:30 PM - 7:00 AM IST

## Execution Status Options

- **SUCCESS**: Pipeline executed successfully
- **FAILED**: Pipeline failed during execution
- **RUNNING**: Pipeline is currently running
- **PENDING**: Pipeline is waiting to start
- **NOT_STARTED**: Pipeline hasn't started yet

## Failure Handling Options

- **YES**: Failure was handled
- **NO**: Failure was not handled
- **PARTIAL**: Failure was partially handled

## Data Load Check Options

- **YES**: Data load was checked after resolution
- **NO**: Data load was not checked
- **NOT_APPLICABLE**: Not applicable for this pipeline

## Files and Directories

### New Files Created
```
/app/api/pipeline-monitoring-records/
  ├── route.ts                    # GET/POST endpoints
  ├── [id]/
  │   └── route.ts               # PUT endpoint for updates
  └── create-shift/
      └── route.ts               # POST endpoint for shift creation

/components/
  └── pipeline-monitoring-records-dashboard.tsx  # Main UI component
```

### Modified Files
```
/prisma/schema.prisma             # Added PipelineMonitoringRecord model
/app/pipelines/page.tsx            # Updated to show tabs
```

## Key Features

1. **Shift-wise Monitoring**: Track pipelines across three shifts
2. **Auto-creation**: Automatically generate records for all pipelines
3. **Comprehensive Details**: 13 monitoring fields per record
4. **Color-coded Status**: Visual indicators for quick status assessment
5. **Searchable & Sortable**: Find records easily
6. **Editable**: Update any field after creation
7. **Incident Tracking**: Maintain SNOW ticket numbers
8. **Audit Trail**: Timestamps for all records
9. **User Isolation**: Records are isolated by user
10. **Unique Constraints**: Prevents duplicate records per shift

## Usage Example

### Scenario: Monitor 5 Critical Pipelines

1. **Setup** (Day 1):
   - Add 5 critical pipelines to Master Pipelines list
   - Click "Create Shift Records" for A shift
   - 5 empty records are created

2. **Morning Shift** (A Shift - 6:30 AM - 3:00 PM IST):
   - Team member fills in execution details for each pipeline
   - If any pipeline fails, updates SNOW ticket and incident details

3. **Next Shift** (B Shift - 2:20 PM - 11:00 PM IST):
   - Previous team finishes their shift
   - New team member clicks "Create Shift Records" for B shift
   - 5 new empty records are created
   - Team fills in execution details for B shift

4. **Reporting**:
   - Manager can search and filter records
   - View all incidents across shifts
   - Analyze failure patterns

## Database Indexes

The following indexes are created for optimal performance:
- `userId`: Fast user isolation
- `monitoringDate`: Quick date filtering
- `shiftIST`: Fast shift filtering
- `Unique(monitoringDate, shiftIST, adfPipelineName, userId)`: Prevents duplicates

## Error Handling

### Common Errors

1. **"No pipelines found"**
   - Cause: User hasn't added any master pipelines yet
   - Solution: Add pipelines in Master Pipelines tab first

2. **"Record already exists for this date, shift, and pipeline"**
   - Cause: Trying to create duplicate record
   - Solution: Check existing records; use update dialog to modify

3. **"Failed to update record"**
   - Cause: Network or server error
   - Solution: Check network connection; retry operation

## Security

- All operations require user authentication
- Records are isolated by userId
- Users can only see/modify their own records
- Database constraints prevent unauthorized access

## Future Enhancements

- Bulk edit capabilities
- Export to CSV/Excel
- Dashboard analytics
- Automated alerts for failures
- Integration with incident management systems
- Historical trend analysis
- Team-based dashboards
