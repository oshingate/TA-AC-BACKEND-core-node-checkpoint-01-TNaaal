let http = require('http');
let url = require('url');
let fs = require('fs');
let qs = require('querystring');
let path = require('path');

let server = http.createServer(handleServer);
server.listen(5000, () => {
  console.log('server is live on port 5000');
});

function handleServer(req, res) {
  let store = '';
  req.on('data', (chunk) => {
    store += chunk;
  });
  req.on('end', () => {
    parsedUrl = url.parse(req.url).pathname;
    parsedQuery = url.parse(req.url).query;
    queryobj = qs.parse(parsedQuery);
    if (req.method === 'GET' && parsedUrl === '/') {
      res.setHeader('Content-Type', 'text/html');
      fs.createReadStream('./index.html').pipe(res);
    } else if (
      req.method === 'GET' &&
      parsedUrl === '/assets/stylesheets/style.css'
    ) {
      console.log('css');
      res.setHeader('Content-Type', 'text/css');
      fs.createReadStream('./assets/stylesheets/style.css').pipe(res);
    } else if (req.method === 'GET' && parsedUrl === '/assets/cat.jpg') {
      res.setHeader('Content-Type', 'image/jpg');
      fs.createReadStream('./assets/cat.jpg').pipe(res);
    } else if (req.method === 'GET' && parsedUrl === '/about') {
      res.setHeader('Content-Type', 'text/html');
      fs.createReadStream('./about.html').pipe(res);
    } else if (req.method === 'GET' && parsedUrl === '/contact') {
      res.setHeader('Content-Type', 'text/html');
      fs.createReadStream('./contact.html').pipe(res);
    } else if (req.method === 'POST' && parsedUrl === '/form') {
      let formobj = qs.parse(store);
      console.log(formobj);
      let pathFile = path.join(
        __dirname,
        'contacts',
        `${formobj.userName}.json`
      );
      fs.open(pathFile, 'wx', (err, fd) => {
        if (err) return console.log(err);
        fs.writeFile(fd, JSON.stringify(formobj), (err) => {
          if (err) return console.log(err);
          fs.close(fd, () => {
            res.setHeader('Content-Type', 'text/html');
            res.end(`<h2>${formobj.userName}.json file is created</h2>`);
          });
        });
      });
    } else if (
      req.method === 'GET' &&
      parsedUrl === '/users' &&
      'username' in queryobj
    ) {
      console.log(queryobj);

      fs.readFile(`./contacts/${queryobj.username}.json`, (err, data) => {
        if (err) return console.log(err);
        let selectedObj = JSON.parse(data);
        res.setHeader('Content-Type', 'text/html');
        res.write(`<h1>Name:${selectedObj.name}</h1>`);
        res.write(`<h2>Email:${selectedObj.email}</h2>`);
        res.write(`<h2>UserName:${selectedObj.userName}</h2>`);
        res.write(`<h2>Age:${selectedObj.age}</h2>`);
        res.write(`<h2>Bio:${selectedObj.bio}</h2>`);
      });
    } else if (req.method === 'GET' && parsedUrl === '/users') {
      //joining path of directory
      const directoryPath = path.join(__dirname, 'contacts');
      //passsing directoryPath and callback function

      fs.readdir(directoryPath, function (err, files) {
        //handling error
        if (err) {
          return console.log('Unable to scan directory: ' + err);
        }
        //listing all files using forEach
        res.setHeader('Content-Type', 'text/html');
        files.forEach(function (file) {
          // Do whatever you want to do with the file
          fs.readFile(`./contacts/${file}`, (err, data) => {
            if (err) return console.log(err);

            let selectedObj = JSON.parse(data);

            res.write(`<h2>Name:${selectedObj.name}</h2>`);
            res.write(`<h2>Email:${selectedObj.email}</h2>`);
            res.write(`<h2>UserName:${selectedObj.userName}</h2>`);
            res.write(`<h2>Age:${selectedObj.age}</h2>`);
            res.write(`<h2>Bio:${selectedObj.bio}</h2>`);
            res.write(`<hr/>`);
          });
          console.log(file);
        });
      });
      // res.end();
    }
  });
}
