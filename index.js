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
  const { url, size = 200, format = 'png', x = 0, y = 0, zoom = 1 } = req.query;

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

    // Calculate cropping dimensions based on zoom, x, y
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width;
    const height = metadata.height;

    const zoomedWidth = Math.floor(width / zoom);
    const zoomedHeight = Math.floor(height / zoom);

    const cropX = Math.max(0, Math.min(parseInt(x), width - zoomedWidth));
    const cropY = Math.max(0, Math.min(parseInt(y), height - zoomedHeight));

    const circleImage = await sharp(buffer)
      .extract({ width: zoomedWidth, height: zoomedHeight, left: cropX, top: cropY }) // Crop the image
      .resize({ width: parseInt(size), height: parseInt(size) }) // Resize to square
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
