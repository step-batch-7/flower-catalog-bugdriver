const { readFileSync, existsSync, statSync } = require('fs');
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

const getHandlers = {
  other: getFileDataResponse,
};

const postHandlers = {};

const handlers = {
  GET: getHandlers,
  POST: postHandlers,
};

const pickHandler = function(req) {
  const handlerType = handlers[req.method];
  return handlerType[req.url] || handlerType.other || getNotFoundResponse;
};

exports.pickHandler = pickHandler;
