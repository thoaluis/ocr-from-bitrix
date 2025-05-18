const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());

app.post("/ocr-from-bitrix", async (req, res) => {
    console.log("📥 Received webhook from Bitrix");

    const data = req.body;
    const contactId = data?.data?.FIELDS?.ID;
    const updatedFields = data?.data?.FIELDS;

    if (!contactId || !updatedFields) {
        console.error("❌ Invalid webhook payload");
        return res.status(400).send("Invalid payload");
    }

    // Example: Retrieve file URL from Passport File field (adjust field code as needed)
    const passportFileUrl = updatedFields["UF_CRM_1747408898"];
    if (!passportFileUrl) {
        console.warn("⚠️ Passport file not attached.");
        return res.status(200).send("No passport file");
    }

    try {
        // Call OCR API
        const ocrResponse = await axios.post("https://ocr-passport-api.onrender.com/ocr-passport", {
            image_url: passportFileUrl,
            contact_id: contactId
        });

        console.log("✅ OCR request sent successfully");
        res.status(200).send("OCR triggered");
    } catch (err) {
        console.error("🔥 OCR request failed:", err.message);
        res.status(500).send("OCR trigger failed");
    }
});

app.listen(PORT, () => {
    console.log(`🚀 OCR From Bitrix listening on port ${PORT}`);
});
