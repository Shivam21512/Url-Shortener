require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Example API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// --- URL Shortener Implementation ---

// In-memory "database"
const urlDatabase = {};
let idCounter = 1;

// Validate URL
function isValidUrl(url) {
  const urlPattern = /^(http|https):\/\/[^ "]+$/;
  return urlPattern.test(url);
}

// POST endpoint to create short URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  if (!isValidUrl(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Check if URL already exists
  const existingEntry = Object.entries(urlDatabase).find(
    ([key, value]) => value === originalUrl
  );

  if (existingEntry) {
    return res.json({ original_url: originalUrl, short_url: existingEntry[0] });
  }

  // Store new URL
  const shortUrl = idCounter++;
  urlDatabase[shortUrl] = originalUrl;

  res.json({ original_url: originalUrl, short_url: shortUrl });
});

// GET endpoint to redirect to original URL
app.get('/api/shorturl/:id', (req, res) => {
  const id = req.params.id;
  const originalUrl = urlDatabase[id];

  if (originalUrl) {
    return res.redirect(originalUrl);
  } else {
    return res.json({ error: 'No URL found' });
  }
});

// Start server
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
