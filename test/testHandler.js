const request = require('supertest');
const { app } = require('../lib/handler');

describe('GET', function() {
  it("'/' should give index.html", function(done) {
    request((req, res) => app.serve(req, res))
      .get('/')
      .expect(200)
      .expect('Content-Type', 'text/html')
      .expect('Content-Length', '801')
      .expect('Date', /./)
      .expect(/Flower Catalog/, done);
  });
  it('validFilePath should give the file', function(done) {
    request((req, res) => app.serve(req, res))
      .get('/agerantum.html')
      .expect(200)
      .expect('Content-Type', 'text/html')
      .expect('Content-Length', '1352')
      .expect('Date', /./)
      .expect(/Agerantum/, done);
  });
  it('guestBook.html should give dynamic guestBook', function(done) {
    request((req, res) => app.serve(req, res))
      .get('/guestBook.html')
      .expect(200)
      .expect('Content-Type', 'text/html')
      .expect('Date', /./)
      .expect(/Guest Book/, done);
  });
  it('should give NOT FOUND response for nonExisting file', function(done) {
    request((req, res) => app.serve(req, res))
      .get('/badfile')
      .expect(404, done);
  });
  it('should redirect guestbook and save comments', function(done) {
    request((req, res) => app.serve(req, res))
      .post('/guestBookPost')
      .send('name=testname&comment=testcomment')
      .expect(303)
      .expect('location', '/guestBook.html', done);
  });
});
