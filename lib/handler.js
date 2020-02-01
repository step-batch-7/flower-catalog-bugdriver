const fs = require('fs');
const { parse } = require('querystring');
const { App } = require('./app');
const Comment = require('./comment');
const Comments = require('./comments');
const config = require('../config');
const COMMENT_PATH = config.DATA_STORE;
const CONTENT_TYPES = require('../CONTENT_TYPES');

const fillTemplate = function(fileName, replaceTokens) {
  const path = `./templates/${fileName}`;
  const content = fs.readFileSync(path, 'UTF8');
  const keys = Object.keys(replaceTokens);
  const replace = (content, key) => {
    const regExp = new RegExp(`__${key}__`, 'g');
    return content.replace(regExp, replaceTokens[key]);
  };
  return keys.reduce(replace, content);
};

const saveComment = function(commentDetails) {
  fs.writeFileSync(COMMENT_PATH, commentDetails, 'utf8');
};

const loadComments = function() {
  let commentDetails = '';
  const isExistingFile =
    fs.existsSync(COMMENT_PATH) && fs.statSync(COMMENT_PATH).isFile();
  if (isExistingFile) {
    commentDetails = fs.readFileSync(COMMENT_PATH);
  }
  return commentDetails;
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
  res.writeHead(404, 'Not Found');
  res.end(body);
};

const getFileDataResponse = function(req, res, next) {
  const url = req.url == '/' ? '/index.html' : req.url;
  const filePath = `public${url}`;
  const isExistingFile =
    fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  if (!isExistingFile) return next();
  const extension = filePath.split('.').pop();
  res.setHeader('Content-Type', CONTENT_TYPES[extension]);
  res.end(fs.readFileSync(filePath));
};

const handleGuestBookGet = function(req, res) {
  const commentJSON = loadComments();
  const comments = Comments.load(commentJSON);
  const commentsAsHtml = comments.toHtml();
  const data = fillTemplate('../public/guestBook.html', {
    tbody: commentsAsHtml,
  });
  res.setHeader('Content-Type', CONTENT_TYPES['html']);
  res.end(data);
};

const handleGuestBookPost = function(req, res) {
  let commentJSON = loadComments();
  const comments = Comments.load(commentJSON);
  const { name, comment } = parse(req.body);
  const dateTime = new Date().toLocaleString();
  comments.addComment(new Comment(name, comment, dateTime));
  saveComment(comments.toJSON());
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
