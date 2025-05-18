const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

// Bitrix webhook token
const BITRIX_TOKEN = 'up6p1oq9mekvs9gk';
const BITRIX_API = `https://panam.pan-american.vn/rest/1/${BITRIX_TOKEN}/`;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/ocr-from-bitrix", async (req, res) => {
  console.log("📥 Received webhook from Bitrix");
  console.log("🔥 Payload:", req.body);

  const contactId = req.body?.data?.FIELDS?.ID || req.body['data[FIELDS][ID]'];
  if (!contactId) {
    console.log("❌ Missing contact ID");
    return res.status(400).send("No contact ID found");
  }

  try {
    // Step 1: Get contact info
    const contactRes = await axios.post(`${BITRIX_API}crm.contact.get.json`, { id: contactId });
    const contact = contactRes.data.result;
    const passportFileId = contact["UF_CRM_1747408898"]?.id;

    if (!passportFileId) {
      console.log("⚠️ No passport file attached");
      return res.status(200).send("No passport file");
    }

    // Step 2: Get download URL
    const fileRes = await axios.post(`${BITRIX_API}disk.file.get.json`, { id: passportFileId });
    const downloadUrl = fileRes.data.result.DOWNLOAD_URL;

    if (!downloadUrl) {
      console.log("⚠️ No DOWNLOAD_URL returned");
      return res.status(200).send("No download URL");
    }

    // Step 3: Call OCR API with download URL
    const ocrRes = await axios.post("https://ocr-passport-api.onrender.com/ocr-passport", {
      image_url: downloadUrl,
      contact_id: contactId
    });

    console.log("✅ OCR processing triggered");
    return res.status(200).send("OCR done");
  } catch (error) {
    console.error("🔥 Error:", error.message);
    return res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Listening on port ${PORT}`);
});
