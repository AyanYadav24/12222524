const express = require('express');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

//function to generate globally unique shortIDs of length 6 (can use crypto)
function random6() {
    let hashedString = "abcdefghijklmnopqrstuvwxyz1234567890~!@#$%^&*";
    let randomString = "";
    for(let i=0;i<6;i++){
        let randomIndex = Math.floor(Math.random() * hashedString.length);
        let randomChar = hashedString[randomIndex];
        randomString += randomChar;
    }
    return randomString;
}

//Storage to map the orginal URL to shortened URL (as JSON)
//each entry has two properties uniqueshortID -> {url : string , expiresAt  : Date}
const urlMapper = {};

//@desc API endpoint for URL Shortener
//@access : Public
//@method : POST

app.post('/shorten', (req, res) => {
  const { url, validMinutes } = req.body;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing url' });
    }
    if (typeof validMinutes !== 'number' || validMinutes < 0) {
        return res.status(400).json({ error: 'Invalid time for expiry of URL' });
        }
    if(!validMinutes) validMinutes = 30;

  // Generating shortId untill a unique one is not found
  let shortId = "";
  while(urlMapper[shortId]){
    shortId = random6();
  };

  const expiresAt = new Date(Date.now() + validMinutes * 60);

  urlMapper[shortId] = { originalUrl: url, expiresAt };

  const shortUrl = `${req.protocol}://${req.get('host')}/${shortId}`;

  res.json({ shortUrl, expiresAt });
});

//@desc API endpoint for redirection to original URL from shortened URL
//@access : Public
//@method : GET

app.get('/:shortId', (req, res) => {
  const { shortId } = req.params;
  const entry = urlMapper[shortId];

  if (!entry) {
    return res.status(404).send('Short URL not found');
  }

  if (Date().now > entry.expiresAt) {
    delete urlMapper[shortId];
    return res.status(410).send('Short URL has expired');
  }
  res.redirect(entry.originalUrl);
});

//@desc API endpoint for info about the URL 
//@access : Public
//@method : GET

app.get('/shorturls/:shortId' ,(req,res) => {
    const { shortId } = req.params;
    const entry = urlMapper[shortId];
    if (!entry) {
        return res.status(404).send('Short URL not found');
    }
    res.json({OriginalURL : entry.OriginalURL , ExpiryDate : entry.expiresAt});
})
    

//Server running instance
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
