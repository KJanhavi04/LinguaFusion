const express = require("express");
const path = require("path");
// favicon 
const favicon = require('serve-favicon');
const bodyParser = require("body-parser");
const app = express();
const { translate } = require("./translate");
const { synthesizeSpeech } = require("./SpeechSynthesis");
const fs = require("fs");
const multer = require("multer");
const { analyzeDocument } = require("./docAnalysis"); // Import your analyzeDocument function from doc.js

//favicon
app.use(favicon(path.join(__dirname, "/favicon.ico")));

//blolb
const { BlobServiceClient } = require("@azure/storage-blob");
const connectionString =
  "DefaultEndpointsProtocol=https;AccountName=linguafusionaudio;AccountKey=you_KEY;EndpointSuffix=core.windows.net";
const blobServiceClient =
  BlobServiceClient.fromConnectionString(connectionString);
//container
const containerName = "audiofiles";
const createContainerIfNotExists = async (containerName) => {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists({ access: "container" });
  console.log(`Container ${containerName} created or already exists.`);
};

// Call this function whenever you want to create or check the container.
const init = async () => {
  await createContainerIfNotExists(containerName);
};

// Start the initialization
init().catch(console.error);

// Configure multer
const upload = multer({ dest: "uploads/" });

app.use(express.static(path.join(__dirname, "/public")));

app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "html", "/index.html"));
});

app.get("/css/style.css", async (req, res) => {
  res.sendFile(path.join(__dirname, "css", "style.css"));
});

app.use(bodyParser.json());

app.post("/translate", async (req, res) => {
  try {
    const text = req.body.text;
    const to = req.body.to;
    const translatedText = await translate(text, to);
    res.status(200).json({ translatedText });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred while translating the text.");
  }
});


//blolb storage
const uploadAudioToAzure = async (audioFilePath, audioFilename) => {
  const blobName = audioFilename;

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlockBlobClient(blobName);

  await blobClient.uploadFile(audioFilePath);

  console.log(`Uploaded ${audioFilePath} to Azure Storage`);
};

app.post("/speak", async (req, res) => {
  try {
    const text = req.body.text;
    const audioFilename = await synthesizeSpeech(text);

    console.log(`Audio Path ${audioFilename} `);

    // Path of the audio file
    const audioFilePath = path.join(__dirname, audioFilename);

    // Ensure the container exists before uploading the audio file
    await createContainerIfNotExists(containerName);

    // Upload the audio file to Azure Storage
    await uploadAudioToAzure(audioFilePath, audioFilename);
    res.status(200).json({ audioFilename });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred during speech synthesis.");
  }
});

app.post("/analyze", upload.single("document"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const analysisResult = await analyzeDocument(filePath);

    // Optionally, delete the file after analysis
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });

    res.status(200).json(analysisResult);
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred during document analysis." });
  }
});

app.listen(8080, () => {
  console.log("Server successfully running on port 8080");
});
