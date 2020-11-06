const app = require('../../src/app')();
const request = require('supertest');
const mongoose = require('mongoose');
const mongoURL = 'mongodb://localhost:27017/test_db';
mongoose.connect(mongoURL);

let server;

let type1 = 'restaurant';
let name1 = 'Mc Donalds';
let email1 = 'mcdonalds@gmail.com';
let address1 = 'Cabildo 1010';
let city = 'CABA';
let state = 'CABA';
let zip = '1430ACV';
let country = 'Argentina';
let spaces1 = [
    {
      name: "Primer piso",
      hasExit: true,
      m2: "1000",
      estimatedVisitDuration: "60",
      openPlace: false
    },
    {
      name: "Terraza",
      hasExit: false,
      m2: "400",
      estimatedVisitDuration: "45",
      openPlace: true
    }
  ];

let type2 = 'supermarket';
let name2 = 'Coto';
let email2 = 'coto@gmail.com';
let address2 = 'Cabildo 2020';
let spaces2 = [
    {
      name: "Planta baja",
      hasExit: false,
      m2: "3000",
      estimatedVisitDuration: "30",
      openPlace: false
    }
  ];

describe('App test', () => {
  beforeAll(async () => {
    server = await app.listen(5005);
  });

  afterAll(async (done) => {
    await mongoose.connection.close();
    await server.close(done);
  });

  describe('ping', () => {
    test('should return 200', async () => {
      await request(server).get('/ping').expect(200);
    });
  });

  describe('establishments', () => {
    const correctEstablishment1 = {
      type: type1,
      name: name1,
      email: email1,
      address: address1,
      city,
      state,
      zip,
      country,
      spaces: spaces1
    };
    const correctEstablishment2 = {
      type: type2,
      name: name2,
      email: email2,
      address: address2,
      city,
      state,
      zip,
      country,
      spaces: spaces2
    };

    let establishment_id1;
    let establishment_id2;

    describe('add first establishments', () => {
      test('should return 201', async () => {
        await request(server).post('/establishments').send(correctEstablishment1).then(res => {
          expect(res.status).toBe(201);
          establishment_id1 = res.body._id;
        });
      });
    });

    describe('add second establishments', () => {
      test('should return 201', async () => {
        await request(server).post('/establishments').send(correctEstablishment2).then(res => {
          expect(res.status).toBe(201);
          establishment_id2 = res.body._id;
        });
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
      });
    });

    describe('get PDF file', () => {
      test('should get a PDF document in the response', async () => {
        await request(server).get(`/establishments/PDF/${establishment_id1}`).then(res => {
          expect(res.status).toBe(200);
          expect(res.header['content-type']).toBe('application/pdf');
          expect(res.header['content-disposition']).toContain('attachment');
        });
      });
    });
  });

  describe('visits', () => {
    const establishment = {
      type: type1,
      name: name1,
      email: email1,
      address: address1,
      city,
      state,
      zip,
      country,
      spaces: spaces1
    };

    let establishment_id1;
    let spaces1_id;

    beforeAll(async () => {
      await request(server).post('/establishments').send(establishment).then(res1 => {
        expect(res1.status).toBe(201);
        establishment_id1 = res1.body._id;
      });
      await request(server).get(`/establishments/${establishment_id1}`).then(res2 => {
        expect(res2.status).toBe(200);
        spaces1_id = res2.body.spaces;
      });
    });

    describe('add visits', () => {
      test('add first visit should return 201', async () => {
        const visit = {
          scanCode: spaces1_id[0],
          userGeneratedCode: "QWER1234YUIO",
          timestamp: Date.now()
        };
        await request(server).post('/visits').send(visit).then(res => {
          expect(res.status).toBe(201);
        });
      });

      test('add second visit to the same space should return 201', async () => {
        const visit = {
          scanCode: spaces1_id[0],
          userGeneratedCode: "BNIUO1NT12NBF",
          timestamp: Date.now()
        };
        await request(server).post('/visits').send(visit).then(res => {
          expect(res.status).toBe(201);
        });
      });

      test('add visit with the same generated code to the same space should return 409', async () => {
        const visit = {
          scanCode: spaces1_id[0],
          userGeneratedCode: "QWER1234YUIO",
          timestamp: Date.now()
        };
        await request(server).post('/visits').send(visit).then(res => {
          expect(res.status).toBe(409);
        });
      });

      test('add visit with the same generated code to the other space should return 409', async () => {
        const visit = {
          scanCode: spaces1_id[1],
          userGeneratedCode: "QWER1234YUIO",
          timestamp: Date.now()
        };
        await request(server).post('/visits').send(visit).then(res => {
          expect(res.status).toBe(409);
        });
      });

      test('get visits to the first space should return 2 scans', async () => {
        await request(server).get(`/visits?scanCode=${spaces1_id[0]}`).then(res => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(2);
          expect([res.body[0].userGeneratedCode, res.body[1].userGeneratedCode]).toContain("BNIUO1NT12NBF");
          expect([res.body[0].userGeneratedCode, res.body[1].userGeneratedCode]).toContain("QWER1234YUIO");
        });
      });

      test('get visits to the second space should return 0 scans', async () => {
        await request(server).get(`/visits?scanCode=${spaces1_id[1]}`).then(res => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(0);
        });
      });

      test('add visit to non existent scan code should return 404', async () => {
        const visit = {
          scanCode: new mongoose.Types.ObjectId(),
          userGeneratedCode: "XCBVQIWERU1234",
          timestamp: Date.now()
        };
        await request(server).post('/visits').send(visit).then(res => {
          expect(res.status).toBe(404);
        });
      });

      test('add visit to the second space with _exit suffix should return 201', async () => {
        const visit = {
          scanCode: `${spaces1_id[1]}_exit`,
          userGeneratedCode: "POIQULNVOER",
          timestamp: Date.now()
        };
        await request(server).post('/visits').send(visit).then(res => {
          expect(res.status).toBe(201);
        });
      });

      test('get visits to the second space should return 1 scan with isExitScan set to true', async () => {
        await request(server).get(`/visits?scanCode=${spaces1_id[1]}`).then(res => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(1);
          expect(res.body[0].isExitScan).toBeTruthy();
        });
      });
    });
  });
});
