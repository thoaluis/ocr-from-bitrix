const express = require('express');
const app = express();
const port = process.env.PORT || 10000;

// Cho phép nhận dữ liệu dạng form và json
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/ocr-from-bitrix', (req, res) => {
  console.log('📥 Received webhook from Bitrix');
  console.log('🔥 Payload:', req.body);

  const contactId = req.body['data[FIELDS][ID]'] || req.body?.data?.FIELDS?.ID;

  if (!contactId) {
    console.log('❌ Invalid webhook payload');
    return res.status(400).send('Missing contact ID');
  }

  console.log(`🎯 Extracted contact ID: ${contactId}`);
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`🚀 OCR From Bitrix listening on port ${port}`);
});
