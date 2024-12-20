const express = require('express');
const axios = require('axios');
const sharp = require('sharp');

const app = express();


app.get('/convert', async (req, res) => {
  const { url, format = 'jpg' } = req.query;

  if (!url) {
    return res.status(400).send('Missing image URL.');
  }

  try {
    
    const response = await axios({
      method: 'get',
      url,
      responseType: 'arraybuffer', // Ambil data sebagai buffer
    });

    const buffer = Buffer.from(response.data);

    
    const convertedImage = await sharp(buffer)
      .toFormat(format)
      .toBuffer();

    
    res.set('Content-Type', `image/${format}`);
    res.send(convertedImage);
  } catch (error) {
    console.error('Error converting image:', error.message);
    res.status(500).send('Error converting image.');
  }
});

app.get('/circle', async (req, res) => {
  const { url, size = 200, format = 'png' } = req.query;

  if (!url) {
    return res.status(400).send('Missing image URL.');
  }


  try {

    const response = await axios({
      method: 'get',
      url,
      responseType: 'arraybuffer', 
    });

    const buffer = Buffer.from(response.data);

    const circleImage = await sharp(buffer)
      .resize({ width: parseInt(size), height: parseInt(size) }) // Ubah ukuran ke kotak
      .composite([
        {
          input: Buffer.from(
            `<svg><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`
          ),
          blend: 'dest-in',
        },
      ])
      .toFormat(format)
      .toBuffer();

    res.set('Content-Type', `image/${format}`);
    res.send(circleImage);
  } catch (error) {
    console.error('Error creating circle image:', error.message);
    res.status(500).send('Error creating circle image.');
  }
});


module.exports = app;
