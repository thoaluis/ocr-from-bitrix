
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const BITRIX_BASE = 'https://panam.pan-american.vn/rest/1/up6p1oq9mekvs9gk';

app.post('/ocr-from-bitrix', async (req, res) => {
  const { contact_id, passport_file_id, modified_by } = req.body;
  try {
    // 1. Lấy metadata file
    const fileMeta = await axios.get(`${BITRIX_BASE}/disk.file.get.json?ID=${passport_file_id}`);
    const fileDownloadUrl = fileMeta.data.result.DOWNLOAD_URL;

    // 2. Tải file ảnh về
    const fileResp = await axios.get(fileDownloadUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(fileResp.data, 'binary');

    // 3. Gửi ảnh đến OCR (giả lập ở đây)
    const extracted = {
      last_name: 'PHAM',
      first_name: 'NHAT TRUONG',
      birthdate: '01/01/1992',
      passport_no: 'C8712882',
      issued_date: '06/01/2020',
      expiry_date: '06/01/2030'
    };

    // 4. Cập nhật contact CRM
    await axios.post(`${BITRIX_BASE}/crm.contact.update.json`, {
      id: contact_id,
      fields: {
        NAME: extracted.first_name,
        LAST_NAME: extracted.last_name,
        BIRTHDATE: extracted.birthdate,
        UF_CRM_1581494598: extracted.passport_no,
        UF_CRM_1581494635: extracted.issued_date,
        UF_CRM_1581494668: extracted.expiry_date
      }
    });

    // 5. (Tùy chọn) Gửi cảnh báo
    console.log('Cập nhật thành công contact ID:', contact_id);
    res.send({ status: 'done' });
  } catch (err) {
    console.error('Lỗi xử lý webhook OCR:', err.message);
    res.status(500).send({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`OCR From Bitrix listening on port ${PORT}`);
});
