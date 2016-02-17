
var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var LIST_FILE = path.join(__dirname, 'list.json');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/api/list', function(req, res) {
  fs.readFile(LIST_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.setHeader('Cache-Control', 'no-cache');
    res.json(JSON.parse(data));
  });
});

app.post('/api/list', function(req, res) {
  fs.readFile(LIST_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var comments = JSON.parse(data);
    // NOTE: In a real implementation, we would likely rely on a database or
    // some other approach (e.g. UUIDs) to ensure a globally unique id. We'll
    // treat Date.now() as unique-enough for our purposes.

    var newComment = {
      detail: req.body.detail,
      id: +req.body.id
    };

    comments.push(newComment);

    fs.writeFile(LIST_FILE, JSON.stringify(comments, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.setHeader('Cache-Control', 'no-cache');
      res.json(comments);
    });
  });
});

app.post('/api/list/delete', function(req, res) {
  fs.readFile(LIST_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var comments = JSON.parse(data);
    
    var delete_id = req.body.id;
    
    comments = comments.filter(function(obj) {
      return +obj.id !== +delete_id;
    });

    fs.writeFile(LIST_FILE, JSON.stringify(comments, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.setHeader('Cache-Control', 'no-cache');
      res.json(comments);
    });
  });
});


app.listen(app.get('port'), function() {
  //console.log('Server started: http://localhost:' + app.get('port') + '/');
});