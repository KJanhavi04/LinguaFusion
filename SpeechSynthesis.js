const sdk = require("microsoft-cognitiveservices-speech-sdk");
const fs = require("fs");

//specch
// Replace the subscriptionKey and serviceRegion with your actual values
const subscriptionKey = "your KRY";
const serviceRegion = "eastus";

async function synthesizeSpeech(text) {
  const audioFile = `audio/audio_${Date.now()}.wav`;

  const speechConfig = sdk.SpeechConfig.fromSubscription(
    subscriptionKey,
    serviceRegion
  );
  const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFile);
  speechConfig.speechSynthesisVoiceName = "en-US-AvaMultilingualNeural";

  const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

  return new Promise((resolve, reject) => {
    synthesizer.speakTextAsync(
      text,
      function (result) {
        console.log("hello one.");
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          console.log("Synthesis finished.");
          resolve(audioFile);
        } else {
          console.error("Speech synthesis canceled, " + result.errorDetails);
          reject("Speech synthesis canceled.");
        }
        synthesizer.close();
      },

      function (err) {
        console.error("Error:", err);
        reject("Speech synthesis failed.");
        synthesizer.close();
      }
    );
  });
}

module.exports = { synthesizeSpeech };
