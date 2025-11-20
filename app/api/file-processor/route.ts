import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import * as XLSX from "xlsx"

// Process London Drugs file
async function processLondonDrugs(file: File): Promise<Blob> {
  // Read file
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: "array" })
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]

  // Get all data
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][]

  // Delete top 6 rows
  const processedData = data.slice(6)

  // Convert to CSV first, then to TXT format with commas as separators
  const txtContent = processedData
    .map((row) => {
      if (Array.isArray(row)) {
        return row.map((cell) => String(cell || "")).join(",")
      }
      return ""
    })
    .join("\n")

  // Create blob for TXT file
  return new Blob([txtContent], { type: "text/plain" })
}

// Process Walmart ecom file
async function processWalmartEcom(file: File): Promise<Blob> {
  // Read input file
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: "array" })
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]

  // Get data
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][]

  // Get headers (first row)
  const headers = (data[0] as string[]) || []

  // Rename first three columns
  const newHeaders = [
    "Renamed_Column_1",
    "Renamed_Column_2",
    "Renamed_Column_3",
    ...headers.slice(3),
  ]

  // Prepare rows with new headers
  const processedRows = data.slice(1).map((row) => {
    if (Array.isArray(row)) {
      const newRow: Record<string, unknown> = {}
      newHeaders.forEach((header, index) => {
        newRow[header] = row[index] || ""
      })
      return newRow
    }
    return {}
  })

  // Create new workbook with processed data
  const newWorkbook = XLSX.utils.book_new()
  const newWorksheet = XLSX.utils.json_to_sheet([
    newHeaders,
    ...processedRows.map((row) => Object.values(row)),
  ])

  XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Sheet1")

  // Apply decimal format to columns containing "units" in header
  newWorksheet.forEach((cell: any, cellAddress: any) => {
    if (typeof cellAddress === "string") {
      const headerCell = newWorksheet[`${cellAddress.charAt(0)}1`]
      if (
        headerCell &&
        typeof headerCell.v === "string" &&
        headerCell.v.toLowerCase().includes("units")
      ) {
        if (cell && typeof cell === "object") {
          cell.z = "0.00" // Format as decimal
        }
      }
    }
  })

  // Convert to buffer
  const outputBuffer = XLSX.write(newWorkbook, {
    bookType: "xlsx",
    type: "array",
  })

  return new Blob([outputBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}

// Process Loblaws POS PCX file
async function processLoblawsPosPcx(file: File): Promise<Blob> {
  // Read input file
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: "array" })
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]

  // Get data
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][]

  // Get headers (first row)
  const headers = (data[0] as string[]) || []

  // Map column names to rename them
  const columnMapping: Record<string, string> = {
    "Online Sales": "PCX Sales",
    "Online Units": "PCX Units",
    "In Store Sales Pen": "PCX Sales Pen",
    "In Store Units Pen": "PCX Units Pen",
  }

  // Create new headers with renames
  const newHeaders = headers.map((header) => columnMapping[header as string] || header)

  // Prepare rows with new headers
  const processedRows = data.slice(1).map((row) => {
    if (Array.isArray(row)) {
      const newRow: Record<string, unknown> = {}
      newHeaders.forEach((header, index) => {
        newRow[header] = row[index] || ""
      })
      return newRow
    }
    return {}
  })

  // Convert to CSV format
  const csvContent = [
    newHeaders.map((h) => `"${h}"`).join(","),
    ...processedRows.map((row) =>
      newHeaders.map((header) => {
        const value = row[header]
        if (value === null || value === undefined) return '""'
        return `"${String(value).replace(/"/g, '""')}"`
      }).join(",")
    ),
  ].join("\n")

  // Create blob for CSV file
  return new Blob([csvContent], { type: "text/csv" })
}

// Process MBOX LCLSDM week sales file
async function processMboxWeekSales(file: File): Promise<Blob> {
  // Read file
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: "array" })
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]

  // Get all data
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][]

  // Process formatting:
  // Column D (index 3): Format Week End Date as MM/DD/YYYY
  // Column F (index 5): Cut UPC and move to Column E (index 4)

  const processedData = data.map((row, rowIndex) => {
    if (!Array.isArray(row)) return row

    const newRow = [...row]

    // Skip header row
    if (rowIndex === 0) return newRow

    // Column D (index 3): Format date as MM/DD/YYYY
    if (newRow[3]) {
      const date = new Date(newRow[3] as string)
      if (!isNaN(date.getTime())) {
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        const year = date.getFullYear()
        newRow[3] = `${month}/${day}/${year}`
      }
    }

    // Move Column F (UPC) to Column E position
    if (newRow[5]) {
      newRow[4] = newRow[5]
      newRow[5] = ""
    }

    return newRow
  })

  // Convert to CSV format with commas (like London Drugs)
  const txtContent = processedData
    .map((row) => {
      if (Array.isArray(row)) {
        return row.map((cell) => String(cell || "")).join(",")
      }
      return ""
    })
    .join("\n")

  // Create blob for TXT file
  return new Blob([txtContent], { type: "text/plain" })
}

// Process MBOX LCLSDM POS Custom file
async function processMboxPosCustom(file: File): Promise<Blob> {
  // Read file
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: "array" })
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]

  // Get all data
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][]

  // Process formatting:
  // Column D (index 3): Format as YYYY/MM/DD
  // Column F (index 5): Format as number
  // Column L (index 11): Format as currency $###0.00
  // Column N (index 13): Format as currency $###0.00
  // Column M (index 12): Format as number
  // Column P (index 15): Format as number

  const processedData = data.map((row, rowIndex) => {
    if (!Array.isArray(row)) return row

    const newRow = [...row]

    // Skip header row
    if (rowIndex === 0) return newRow

    // Column D (index 3): Format date as YYYY/MM/DD
    if (newRow[3]) {
      const date = new Date(newRow[3] as string)
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        newRow[3] = `${year}/${month}/${day}`
      }
    }

    // Column F (index 5): Ensure it's a number
    if (newRow[5]) {
      newRow[5] = parseFloat(String(newRow[5])) || newRow[5]
    }

    // Column L (index 11): Format as currency $###0.00
    if (newRow[11]) {
      const num = parseFloat(String(newRow[11]))
      if (!isNaN(num)) {
        newRow[11] = num.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })
      }
    }

    // Column N (index 13): Format as currency $###0.00
    if (newRow[13]) {
      const num = parseFloat(String(newRow[13]))
      if (!isNaN(num)) {
        newRow[13] = num.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })
      }
    }

    // Column M (index 12): Ensure it's a number
    if (newRow[12]) {
      newRow[12] = parseInt(String(newRow[12])) || newRow[12]
    }

    // Column P (index 15): Ensure it's a number
    if (newRow[15]) {
      newRow[15] = parseInt(String(newRow[15])) || newRow[15]
    }

    return newRow
  })

  // Convert to CSV format
  const csvContent = [
    processedData[0]?.map((h) => `"${h}"`).join(",") || "",
    ...processedData.slice(1).map((row) =>
      (Array.isArray(row) ? row : [row]).map((cell) => {
        if (cell === null || cell === undefined) return '""'
        return `"${String(cell).replace(/"/g, '""')}"`
      }).join(",")
    ),
  ].join("\n")

  // Create blob for CSV file
  return new Blob([csvContent], { type: "text/csv" })
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession()
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    const supplier = formData.get("supplier") as string
    const originalFileName = formData.get("originalFileName") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!supplier || !["london-drugs", "walmart-ecom", "loblaws-pos-pcx", "mbox-lclsdm-week-sales", "mbox-lclsdm-pos-custom"].includes(supplier)) {
      return NextResponse.json({ error: "Invalid supplier" }, { status: 400 })
    }

    // Process file based on supplier
    let processedBlob: Blob
    let fileExtension: string
    let contentType: string

    if (supplier === "london-drugs") {
      processedBlob = await processLondonDrugs(file)
      fileExtension = "txt"
      contentType = "text/plain"
    } else if (supplier === "walmart-ecom") {
      processedBlob = await processWalmartEcom(file)
      fileExtension = "xlsx"
      contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    } else if (supplier === "loblaws-pos-pcx") {
      processedBlob = await processLoblawsPosPcx(file)
      fileExtension = "csv"
      contentType = "text/csv"
    } else if (supplier === "mbox-lclsdm-week-sales") {
      processedBlob = await processMboxWeekSales(file)
      fileExtension = "txt"
      contentType = "text/plain"
    } else {
      // mbox-lclsdm-pos-custom
      processedBlob = await processMboxPosCustom(file)
      fileExtension = "csv"
      contentType = "text/csv"
    }

    // Use original filename with appropriate extension
    let filename: string
    if (originalFileName) {
      const nameParts = originalFileName.split(".")
      nameParts.pop() // Remove old extension
      filename = `${nameParts.join(".")}.${fileExtension}`
    } else {
      // Fallback filename
      const timestamp = new Date().toISOString().split("T")[0]
      filename = `processed_${supplier}_${timestamp}.${fileExtension}`
    }

    // Return file as response
    const headers = {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
    }

    return new NextResponse(processedBlob, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("File processing error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process file",
      },
      { status: 500 }
    )
  }
}

