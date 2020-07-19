const app = require('../../src/app')();
const request = require('supertest');
const mongoose = require('mongoose');
const mongoURL = 'mongodb://localhost:27017/test_db';
mongoose.connect(mongoURL);

let server;

let id1 = 1;
let type1 = 'restaurant';
let name1 = 'Mc Donalds';
let email1 = 'mcdonalds@gmail.com';
let address1 = 'Cabildo 1010';
let city = 'CABA';
let province = 'CABA';
let zip = '1430ACV';
let country = 'Argentina';
let QRs1 = ['ASDF1234', 'QWER4563'];

let id2 = 2;
let type2 = 'supermarket';
let name2 = 'Coto';
let email2 = 'coto@gmail.com';
let address2 = 'Cabildo 2020';
let QRs2 = ['POU034F', 'ZXCV4567'];


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

  describe('establishments', () => {
    const correctEstablishment1 = {
      id1,
      type1,
      name1,
      email1,
      address1,
      city,
      province,
      zip,
      country,
      QRs1
    };
    const correctEstablishment2 = {
      id2,
      type2,
      name2,
      email2,
      address2,
      city,
      province,
      zip,
      country,
      QRs2
    };

    describe('add correct establishments', () => {
      test('should return 201', async () => {
        await request(server).post('/establishments').send(correctEstablishment1).expect('Content-Type', /json/).expect(201);
        await request(server).post('/establishments').send(correctEstablishment2).expect('Content-Type', /json/).expect(201);
      });
    });

    describe('get establishments', () => {
      test('should return all establishments', async () => {
        await request(server).get('/establishments').then(res => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveLength(2);
        });
      });
    });

    describe('get matching establishments', () => {
      describe('by type', () => {
        test('when restaurant, should return only restaurant establishment', async () => {
          await request(server).get('/establishments?type=restaurant').then(res => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
          });
        });
      });

      describe('by name', () => {
        test('when full match, should return that establishment', async () => {
          await request(server).get('/establishments?name=Coto').then(res => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
          });
        });

        test('when partial text match, should return all matching establishments', async () => {
          await request(server).get('/establishments?textMatch=Mc').then(res => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
          });
        });
      });
    });
  });
});
