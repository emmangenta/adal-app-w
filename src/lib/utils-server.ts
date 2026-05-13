import { v4 as uuidv4 } from "uuid";

export function generateId(): string {
  return uuidv4();
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/** Browsers often send an empty `type`; infer from extension for PDF/DOCX. */
export function inferMimeFromFilename(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return "";
}

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(arrayBuffer) });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

export async function extractTextFromWord(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export async function extractTextFromDocument(file: File): Promise<string> {
  const mimeType = file.type || inferMimeFromFilename(file.name);

  if (mimeType === "application/pdf") {
    return extractTextFromPDF(file);
  } else if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return extractTextFromWord(file);
  } else {
    throw new Error(
      `Unsupported file type: "${mimeType || "(empty)"}" for ${file.name}. Use .pdf or .docx.`
    );
  }
}
