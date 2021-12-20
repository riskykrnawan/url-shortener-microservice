require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const dns = require('dns');
const URL = require('url').URL;
const cors = require('cors');
const mongodb = require('mongodb');
const mongoose = require('mongoose');


const app = express();


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const urlSchema = new mongoose.Schema ({
  original_url : String, 
  short_url : Number 
});

const Url = mongoose.model('Url', urlSchema);


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', (req, res) => {
  let originalURL = req.body.url;
  if (!originalURL.includes("https://")) {
      res.json({ error: "Invalid URL"  });
  }
  let urlObject = new URL(originalURL);
  let shortUrl = Math.floor(Math.random() * 10000);
  dns.lookup(urlObject.hostname, (err, addresses, family) => {
    if(err) {
      res.json({ error: "Invalid URL"  });
    } else {
      let newData = new Url({
        original_url : originalURL, 
        short_url : shortUrl 
      }) 
      newData.save();
      res.json({ 
        original_url : originalURL, 
        short_url : shortUrl 
      });

    }
  }); 
});

app.get('/api/shorturl/:new', (req, res) => {
  Url.findOne({short_url: req.params.new}, (err, foundUrl) => {
    if(foundUrl) {
      res.redirect(foundUrl.original_url)
    }
  })
})


// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
