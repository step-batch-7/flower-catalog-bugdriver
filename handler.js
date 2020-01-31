const { existsSync, statSync, readFileSync, writeFileSync } = require('fs');
const { parse } = require('querystring');
const { App } = require('./app');
const COMMENT_PATH = 'public/data/commentsData.json';

const fillTemplate = function(fileName, replaceTokens) {
  const path = `./templates/${fileName}`;
  const content = readFileSync(path, 'UTF8');
  const keys = Object.keys(replaceTokens);
  const replace = (content, key) => {
    const regExp = new RegExp(`__${key}__`, 'g');
    return content.replace(regExp, replaceTokens[key]);
  };
  return keys.reduce(replace, content);
};

const saveComment = function(commentDetails) {
  writeFileSync(COMMENT_PATH, JSON.stringify(commentDetails), 'utf8');
};

const getNotFoundResponse = function(req, res) {
  const body = `<html>
    <head>
      <title>NOT FOUND</title>
    </head>
    <body>
      <h4>requested resource is not found on the server</h4>
    </body>
  </html>`;
  res.end(body);
};

const getFileDataResponse = function(req, res, next) {
  const url = req.url == '/' ? '/index.html' : req.url;
  const filePath = `public${url}`;
  const isExistingFile = existsSync(filePath) && statSync(filePath).isFile();
  if (!isExistingFile) return next();
  res.end(readFileSync(filePath));
};

const handleGuestBookGet = function(req, res) {
  const commentDetails = require('./public/data/commentsData.json');
  const commentList = commentDetails.map(commentDetail => {
    const dateTime = commentDetail.dateTime;
    const name = commentDetail.name;
    const comment = commentDetail.comment.replace(/\r\n/g, '</br>');
    return fillTemplate('/tbodyComment.html', {
      dateTime,
      name,
      comment,
    });
  });
  const data = fillTemplate('../public/guestBook.html', {
    tbody: commentList.join(''),
  });
  res.end(data);
};

const handleGuestBookPost = function(req, res) {
  const commentDetails = require('./public/data/commentsData.json');
  const { name, comment } = parse(req.body);
  const dateTime = new Date().toLocaleString();
  commentDetails.unshift({ name, comment, dateTime });
  saveComment(commentDetails);
  res.writeHead(303, { Location: '/guestBook.html' });
  res.end();
};

const readBody = function(req, res, next) {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', () => {
    req.body = body;
    next();
  });
};

const app = new App();
app.use(readBody);
app.get('/guestBook.html', handleGuestBookGet);
app.get('', getFileDataResponse);
app.get('', getNotFoundResponse);
app.post('/guestBookPost', handleGuestBookPost);
app.post('', getNotFoundResponse);

module.exports = { app };
