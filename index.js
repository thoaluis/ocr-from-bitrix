const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 10000;
const BITRIX_TOKEN = 'up6p1oq9mekvs9gk';
const BITRIX_BASE = `https://panam.pan-american.vn/rest/1/${BITRIX_TOKEN}/`;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/ocr-from-bitrix', async (req, res) => {
  console.log('📥 Received webhook from Bitrix');
  console.log('🔥 Payload:', req.body);

  const contactId = req.body['data[FIELDS][ID]'] || req.body?.data?.FIELDS?.ID;
  if (!contactId) {
    console.log('❌ Invalid webhook payload');
    return res.status(400).send('Missing contact ID');
  }
  console.log(`🎯 Extracted contact ID: ${contactId}`);

  try {
    // Step 1: Get full contact info
    const contactRes = await axios.post(`${BITRIX_BASE}crm.contact.get.json`, { id: contactId });
    const contact = contactRes.data.result;
    const passportFileId = contact.UF_CRM_1747408898;

    if (!passportFileId) {
      console.warn('⚠️ No passport file attached');
      return res.status(200).send('No passport file found');
    }

    // Step 2: Get passport file URL
    const fileRes = await axios.post(`${BITRIX_BASE}disk.file.get.json`, { id: passportFileId });
    const downloadUrl = fileRes.data.result.DOWNLOAD_URL;

    // Step 3: Send image to OCR
    const ocrRes = await axios.post("https://ocr-passport-api.onrender.com/ocr-passport", {
      image_url: downloadUrl,
      contact_id: contactId
    });

    console.log("✅ OCR processing triggered successfully");
    return res.status(200).send("OCR done");
  } catch (err) {
    console.error("🔥 Error in OCR processing:", err.message);
    return res.status(500).send("OCR failed");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 OCR From Bitrix listening on port ${PORT}`);
});
