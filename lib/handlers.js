const { writeFileSync, readFileSync, existsSync, statSync } = require('fs');
const { Response } = require('./response');
const Session = require('./session');
const CONTENT_TYPES = require('./contentTypes.json');
const SESSIONS = {};
let game;

const getSession = function(req) {
  const cookies = req.getCookies();
  const sessionId = cookies['_SESSIONID'];
  return SESSIONS[sessionId];
};

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

const getNotFoundResponse = function() {
  const res = new Response();
  res.body = `<html>
    <head>
      <title>NOT FOUND</title>
    </head>
    <body>
      <h4>requested resource is not found on the server</h4>
    </body>
  </html>`;
  return res;
};

const getFileDataResponse = function(req) {
  const filePath = `public${req.url}`;
  const isExistingFile = existsSync(filePath) && statSync(filePath).isFile();
  if (!isExistingFile) return getNotFoundResponse();
  const extension = filePath.split('.').pop();
  const res = new Response();
  res.setStatusCodeOk();
  res.body = readFileSync(filePath);
  res.setHeader('Content-Type', CONTENT_TYPES[extension]);
  return res;
};

const handleGuestBookGet = function(req) {
  const commentDetails = require('../public/data/commentsData.json');
  const commentList = commentDetails.map(commentDetail => {
    const dateTime = commentDetail.dateTime;
    const name = commentDetail.name;
    const comment = commentDetail.comment;
    return fillTemplate('/tbodyComment.html', {
      dateTime,
      name,
      comment,
    });
  });
  const data = fillTemplate('../public/guestBook.html', {
    tbody: commentList.join(''),
  });
  const res = new Response();
  res.setStatusCodeOk();
  res.body = data;
  res.setHeader('Content-Type', CONTENT_TYPES['html']);
  return res;
};

const handleGuestBookPost = function(req) {
  const commentDetails = require('../public/data/commentsData.json');
  const { name, comment } = req.body;
  const formatedName = name.replace(/\+/g, ' ').replace(/%0D%0A/g, '</br>');
  const formatedComment = comment
    .replace(/\+/g, ' ')
    .replace(/%0D%0A/g, '</br>');
  const dateTime = new Date().toLocaleString();
  commentDetails.push({
    name: formatedName,
    comment: formatedComment,
    dateTime,
  });
  writeFileSync(
    'public/data/commentsData.json',
    JSON.stringify(commentDetails),
    'utf8'
  );
  const res = new Response();
  res.redirect('/guestBook.html');
  return res;
};

const getHandlers = {
  '/guestBook.html': handleGuestBookGet,
  other: getFileDataResponse,
};

const postHandlers = {
  '/guestBookPost': handleGuestBookPost,
};

const handlers = {
  GET: getHandlers,
  POST: postHandlers,
};

const pickHandler = function(req) {
  const handlerType = handlers[req.method];
  return handlerType[req.url] || handlerType.other || getNotFoundResponse;
};

exports.pickHandler = pickHandler;
