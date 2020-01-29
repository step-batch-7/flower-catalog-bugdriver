const { existsSync, statSync, readFileSync, writeFileSync } = require('fs');
const { parse } = require('querystring');

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

const getFileDataResponse = function(req, res) {
  const url = req.url == '/' ? '/index.html' : req.url;
  const filePath = `public${url}`;
  const isExistingFile = existsSync(filePath) && statSync(filePath).isFile();
  if (!isExistingFile) return getNotFoundResponse(req, res);
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
  req.on('data', data => {
    req.body = parse(data);
    console.log(req.body);
    const { name, comment } = req.body;
    const dateTime = new Date().toLocaleString();
    commentDetails.unshift({
      name,
      comment,
      dateTime,
    });
    writeFileSync(
      'public/data/commentsData.json',
      JSON.stringify(commentDetails),
      'utf8'
    );
    res.writeHead(303, {
      Location: '/guestBook.html',
    });
    res.end();
  });
};

const getHandler = {
  '/guestBook.html': handleGuestBookGet,
  other: getFileDataResponse,
};
const postHandler = {
  '/guestBookPost': handleGuestBookPost,
};

const handlers = {
  GET: getHandler,
  POST: postHandler,
};

const pickHandler = function(req) {
  const handlerType = handlers[req.method];
  return handlerType[req.url] || handlerType.other || getNotFoundResponse;
};

module.exports = { pickHandler };
