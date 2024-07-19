const {
  AzureKeyCredential,
  DocumentAnalysisClient,
} = require('@azure/ai-form-recognizer');
const fs = require('fs');

//doc
// Your Azure Form Recognizer API key and endpoint
const apiKey = "your key";
const endpoint = "https://translatordocapp.cognitiveservices.azure.com/";

// Function to analyze the document using Azure Form Recognizer
// Analyze the document and return structured data
async function analyzeDocument(filePath) {
  const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apiKey));
  const readStream = fs.createReadStream(filePath);

  // Use the prebuilt-layout model to analyze the document
  const poller = await client.beginAnalyzeDocument('prebuilt-layout', readStream);
  const result = await poller.pollUntilDone();

  // Structure the output with text and tables
  const output = {
      text: '',
      tables: []
  };

  // Collect text data from pages
  if (result.pages) {
      result.pages.forEach(page => {
          page.lines.forEach(line => {
              output.text += `${line.content}\n`;
          });
      });
  }

  // Collect table data from the document
  if (result.tables) {
      output.tables = result.tables.map(table => ({
          rows: table.rowCount,
          columns: table.columnCount,
          cells: table.cells.map(cell => ({
              content: cell.content,
              rowIndex: cell.rowIndex,
              columnIndex: cell.columnIndex,
          })),
      }));
  }

  return output;
}

// Export the analyzeDocument function
module.exports = { analyzeDocument };
