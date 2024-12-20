const express = require('express');
const axios = require('axios');
const sharp = require('sharp');

const app = express();

// Endpoint untuk konversi gambar
app.get('/convert', async (req, res) => {
  const { url, format = 'jpg' } = req.query;

  if (!url) {
    return res.status(400).send('Missing image URL.');
  }

  try {
    // Unduh gambar asli dari URL
    const response = await axios({
      method: 'get',
      url,
      responseType: 'arraybuffer', // Ambil data sebagai buffer
    });

    const buffer = Buffer.from(response.data);

    // Konversi gambar menggunakan Sharp
    const convertedImage = await sharp(buffer)
      .toFormat(format)
      .toBuffer();

    // Kirim gambar hasil konversi
    res.set('Content-Type', `image/${format}`);
    res.send(convertedImage);
  } catch (error) {
    console.error('Error converting image:', error.message);
    res.status(500).send('Error converting image.');
  }
});

module.exports = app;
