// init project
const express = require('express')
const app = express()
const request = require('request');
const apiKey = process.env.API_KEY;
const apiRoot = 'https://api.propublica.org/congress/v1/';
const sassMiddleware = require("node-sass-middleware");

app.use(sassMiddleware({
  src: __dirname + '/public',
  dest: __dirname + '/public',
  //debug: true,
  //outputStyle: 'compressed',
}));

app.use(express.static('public'))
app.use(express.static('/tmp'));

app.get("/", (request, response) => {
  response.sendFile(__dirname + '/views/index.html')
})

app.get("/bills", (req, res) => {
  var options = {
    url: apiRoot + 'bills/search.json?query=' + req.query.q,
    headers: {
      'X-API-Key': apiKey
    },
    json: true
  };
  request(options, function (error, response, body) {
    res.json(response);
  });
});

app.get("/statements", (req, res) => {
  var options = {
    url: apiRoot + 'statements/search.json?query=' + req.query.q,
    headers: {
      'X-API-Key': apiKey
    },
    json: true
  };
  request(options, function (error, response, body) {
    res.json(response);
  });
});

app.get("/members", (req, res) => {
 var options = {
    url: apiRoot + 'members/' + req.query.id + '.json',
    headers: {
      'X-API-Key': apiKey
    },
    json: true
  };
  request(options, function (error, response, body) {
    res.json(response);
  });
});


// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})
