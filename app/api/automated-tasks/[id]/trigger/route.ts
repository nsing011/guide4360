import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { readFile } from "fs/promises"
import { join } from "path"
import * as XLSX from 'xlsx'

// Task-specific processing functions
const processRetailerData = (workbook: XLSX.WorkBook) => {
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(worksheet)
  
  // Example: Add a new column with processed data
  const processedData = data.map((row: any, index: number) => ({
    ...row,
    'Processed_Date': new Date().toISOString().split('T')[0],
    'Row_ID': index + 1,
    'Status': 'Processed'
  }))
  
  const newWorksheet = XLSX.utils.json_to_sheet(processedData)
  const newWorkbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Processed Data')
  
  return newWorkbook
}

const processInventoryUpdate = (workbook: XLSX.WorkBook) => {
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(worksheet)
  
  // Example: Calculate inventory levels and add alerts
  const processedData = data.map((row: any) => ({
    ...row,
    'Updated_Date': new Date().toISOString().split('T')[0],
    'Low_Stock_Alert': (row.Quantity || 0) < 10 ? 'YES' : 'NO',
    'Reorder_Level': Math.max(0, (row.Quantity || 0) - 5)
  }))
  
  const newWorksheet = XLSX.utils.json_to_sheet(processedData)
  const newWorkbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Inventory Update')
  
  return newWorkbook
}

const processSalesReport = (workbook: XLSX.WorkBook) => {
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(worksheet)
  
  // Example: Add summary calculations
  const totalSales = data.reduce((sum: number, row: any) => sum + (row.Amount || 0), 0)
  const avgSale = totalSales / data.length
  
  const processedData = data.map((row: any) => ({
    ...row,
    'Report_Date': new Date().toISOString().split('T')[0],
    'Above_Average': (row.Amount || 0) > avgSale ? 'YES' : 'NO'
  }))
  
  // Add summary row
  processedData.push({
    'Report_Date': new Date().toISOString().split('T')[0],
    'Total_Sales': totalSales,
    'Average_Sale': avgSale,
    'Total_Records': data.length
  })
  
  const newWorksheet = XLSX.utils.json_to_sheet(processedData)
  const newWorkbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Sales Report')
  
  return newWorkbook
}

const processPriceAnalysis = (workbook: XLSX.WorkBook) => {
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(worksheet)
  
  // Example: Price trend analysis
  const processedData = data.map((row: any) => ({
    ...row,
    'Analysis_Date': new Date().toISOString().split('T')[0],
    'Price_Change': row.New_Price && row.Old_Price ? 
      ((row.New_Price - row.Old_Price) / row.Old_Price * 100).toFixed(2) + '%' : 'N/A',
    'Price_Category': row.New_Price > 100 ? 'Premium' : row.New_Price > 50 ? 'Mid' : 'Budget'
  }))
  
  const newWorksheet = XLSX.utils.json_to_sheet(processedData)
  const newWorkbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Price Analysis')
  
  return newWorkbook
}

const processCustomerData = (workbook: XLSX.WorkBook) => {
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(worksheet)
  
  // Example: Customer segmentation
  const processedData = data.map((row: any) => ({
    ...row,
    'Processed_Date': new Date().toISOString().split('T')[0],
    'Customer_Segment': row.Total_Purchases > 1000 ? 'VIP' : 
                       row.Total_Purchases > 500 ? 'Premium' : 'Standard',
    'Last_Contact': new Date().toISOString().split('T')[0]
  }))
  
  const newWorksheet = XLSX.utils.json_to_sheet(processedData)
  const newWorkbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Customer Data')
  
  return newWorkbook
}

const processFinancialReport = (workbook: XLSX.WorkBook) => {
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(worksheet)
  
  // Example: Financial calculations
  const processedData = data.map((row: any) => ({
    ...row,
    'Report_Date': new Date().toISOString().split('T')[0],
    'Net_Profit': (row.Revenue || 0) - (row.Expenses || 0),
    'Profit_Margin': row.Revenue ? 
      (((row.Revenue || 0) - (row.Expenses || 0)) / row.Revenue * 100).toFixed(2) + '%' : 'N/A'
  }))
  
  const newWorksheet = XLSX.utils.json_to_sheet(processedData)
  const newWorkbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Financial Report')
  
  return newWorkbook
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { taskType } = await request.json()

    // Verify the automated task exists and belongs to the user
    const automatedTask = await prisma.automatedTask.findFirst({
      where: {
        id: params.id,
        userId: session.userId,
      },
    })

    if (!automatedTask) {
      return NextResponse.json({ error: "Automated task not found" }, { status: 404 })
    }

    if (!automatedTask.isActive) {
      return NextResponse.json({ error: "Automated task is not active" }, { status: 400 })
    }

    if (!automatedTask.uploadedFile) {
      return NextResponse.json({ error: "No file uploaded for this task" }, { status: 400 })
    }

    // Read the uploaded file
    const filePath = join(process.cwd(), 'uploads', 'automated-tasks', automatedTask.uploadedFile)
    const fileBuffer = await readFile(filePath)
    
    // Parse the XLSX file
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
    
    // Process based on task type
    let processedWorkbook: XLSX.WorkBook
    
    switch (taskType) {
      case 'retailer_data':
        processedWorkbook = processRetailerData(workbook)
        break
      case 'inventory_update':
        processedWorkbook = processInventoryUpdate(workbook)
        break
      case 'sales_report':
        processedWorkbook = processSalesReport(workbook)
        break
      case 'price_analysis':
        processedWorkbook = processPriceAnalysis(workbook)
        break
      case 'customer_data':
        processedWorkbook = processCustomerData(workbook)
        break
      case 'financial_report':
        processedWorkbook = processFinancialReport(workbook)
        break
      default:
        return NextResponse.json({ error: "Unknown task type" }, { status: 400 })
    }

    // Convert processed workbook to buffer
    const processedBuffer = XLSX.write(processedWorkbook, { type: 'buffer', bookType: 'xlsx' })

    // Update the last run time
    await prisma.automatedTask.update({
      where: { id: params.id },
      data: {
        lastRun: new Date(),
      },
    })

    console.log(`Automated task processed: ${automatedTask.name} (${taskType})`, {
      taskId: params.id,
      triggeredBy: session.username,
      timestamp: new Date().toISOString(),
    })

    // Return the processed file as a download
    return new NextResponse(processedBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="processed_${taskType}_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Error processing automated task:", error)
    return NextResponse.json({ error: "Failed to process task" }, { status: 500 })
  }
}
