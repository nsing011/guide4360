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
  newWorksheet.forEach((cell, cellAddress) => {
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

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!supplier || !["london-drugs", "walmart-ecom"].includes(supplier)) {
      return NextResponse.json({ error: "Invalid supplier" }, { status: 400 })
    }

    // Process file based on supplier
    let processedBlob: Blob

    if (supplier === "london-drugs") {
      processedBlob = await processLondonDrugs(file)
    } else {
      processedBlob = await processWalmartEcom(file)
    }

    // Generate filename
    const timestamp = new Date().toISOString().split("T")[0]
    const fileExtension = supplier === "london-drugs" ? "txt" : "xlsx"
    const filename = `processed_${supplier}_${timestamp}.${fileExtension}`

    // Return file as response
    const headers = {
      "Content-Type":
        supplier === "london-drugs" ? "text/plain" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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

