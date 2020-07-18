const app = require('../../src/app')();
const request = require('supertest');
const mongoose = require('mongoose');
const mongoURL = 'mongodb://localhost:27017/test_db';
mongoose.connect(mongoURL);

let server;

let author = "testUser";
let user_id = 1;
let url = "some-url.com/test";
let url2 = "some-url.com/test22";
let thumb = "some-url.com/thumbs/test";
let title = "TestVideo";
let title2 = "THE MOST AWESOME TITLE";
let description = "Some description text";
let visibility = "public";
let date = "09/19/18 14:55:26";

beforeAll(async () => {
  server = await app.listen(5005);
});

afterAll(async (done) => {
  await mongoose.connection.close();
  await server.close(done);
});

describe('App test', () => {
  describe('ping', () => {
    test('should return 200', async () => {
      await request(server).get('/ping').expect(200);
    });
  });

  describe('videos', () => {
    const correctVideo = {
      author,
      user_id,
      url,
      thumb,
      title,
      description,
      visibility,
      date
    };
    const correctVideo2 = {
      author,
      user_id,
      url: url2,
      thumb,
      title: title2,
      description,
      visibility: 'private',
      date
    };

    describe('add correct video', () => {
      test('should return 201', async () => {
        await request(server).post('/videos').send(correctVideo).expect('Content-Type', /json/).expect(201);
        await request(server).post('/videos').send(correctVideo2).expect('Content-Type', /json/).expect(201);
      });
    });

    describe('get videos', () => {
      test('should return all videos', async () => {
        await request(server).get('/videos').then(res => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveLength(2);
        });
      });
    });

    describe('get matching videos', () => {
      describe('by visibility', () => {
        test('when private, should return only private video', async () => {
          await request(server).get('/videos?visibility=private').then(res => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
          });
        });
      });

      describe('by title', () => {
        test('when full match, should return that video', async () => {
          await request(server).get('/videos?title=TestVideo').then(res => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
          });
        });

        test('when partial text match, should return all matching videos', async () => {
          await request(server).get('/videos?textMatch=AweSOm').then(res => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
          });
        });
      });
    });
  });
});