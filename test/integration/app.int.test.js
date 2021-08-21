const app = require('../../src/app')();
const request = require('supertest');
const mongoose = require('mongoose');
const mongoURL = 'mongodb://localhost:27017/test_db';
mongoose.connect(mongoURL);

let server;

let type1 = 'restaurant';
let name1 = 'Mc Donalds';
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
      openPlace: false,
      n95Mandatory: false
    },
    {
      name: "Terraza",
      hasExit: false,
      m2: "400",
      estimatedVisitDuration: "45",
      openPlace: true,
      n95Mandatory: false
    }
  ];

let type2 = 'supermarket';
let name2 = 'Coto';
let address2 = 'Cabildo 2020';
let spaces2 = [
    {
      name: "Planta baja",
      hasExit: false,
      m2: "3000",
      estimatedVisitDuration: "30",
      openPlace: false,
      n95Mandatory: false
    }
  ];
let space3 = {
  name: "Tercer piso",
  hasExit: false,
  m2: 300,
  estimatedVisitDuration: 15,
  openPlace: false,
  n95Mandatory: false
}

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
      address: address2,
      city,
      state,
      zip,
      country,
      spaces: spaces2
    };

    let establishment_id1;
    let establishment_id2;
    let spaces1_ids;
    let spaces2_ids;
    let space3_id;

    describe('add first establishments', () => {
      test('should return 201', async () => {
        await request(server).post('/establishments').send(correctEstablishment1).then(res => {
          expect(res.status).toBe(201);
          establishment_id1 = res.body._id;
          spaces1_ids = res.body.spaces;
        });
      });
    });

    describe('add second establishments', () => {
      test('should return 201', async () => {
        await request(server).post('/establishments').send(correctEstablishment2).then(res => {
          expect(res.status).toBe(201);
          establishment_id2 = res.body._id;
          spaces2_ids = res.body.spaces;
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

    describe('add second space to establishment', () => {
      test('should return all establishments', async () => {
        await request(server).post('/establishments/space').send({...space3, establishmentId: establishment_id2}).then(res => {
          expect(res.status).toBe(201);
          expect(res.body.establishmentId).toBe(establishment_id2);
          expect(res.body.name).toBe(space3.name);
          expect(res.body.hasExit).toBe(space3.hasExit);
          expect(res.body.m2).toBe(space3.m2);
          expect(res.body.estimatedVisitDuration).toBe(space3.estimatedVisitDuration);
          expect(res.body.openPlace).toBe(space3.openPlace);
          expect(res.body.n95Mandatory).toBe(space3.n95Mandatory);
          space3_id = space3._id;
        });
      });
    });

    describe('get establishments', () => {
      test('should still return two establishments', async () => {
        await request(server).get('/establishments').then(res => {
          expect(res.status).toBe(200);
          expect(res.body).toHaveLength(2);
        });
      });
    });

    describe('get establishment', () => {
      test('should still return two establishments', async () => {
        await request(server).get(`/establishments/${establishment_id2}`).then(res => {
          expect(res.status).toBe(200);
          expect(res.body.spaces).toHaveLength(2);
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
      test('should get a PDF document from establishment in the response', async () => {
        await request(server).get(`/establishments/PDF/${establishment_id1}`).then(res => {
          expect(res.status).toBe(200);
          expect(res.header['content-type']).toBe('application/pdf');
          expect(res.header['content-disposition']).toContain('attachment');
        });
      });

      test('should get a PDF document from space in the response', async () => {
        await request(server).get(`/establishments/PDF/${establishment_id1}/space/${spaces1_ids[0]}`).then(res => {
          expect(res.status).toBe(200);
          expect(res.header['content-type']).toBe('application/pdf');
          expect(res.header['content-disposition']).toContain('attachment');
        });
      });
    });

    describe('disable space', () => {
      test('disable space from corresponding establishment should return 201', async () => {
        const spaceUpdateBody = {
          establishmentId: establishment_id1,
          enabled: false,
        };
        await request(server).put(`/establishments/space/${spaces1_ids[0]}`).send(spaceUpdateBody).then(res => {
          expect(res.status).toBe(201);
        });
      });

      test('disabled space should return enabled: false', async () => {
        await request(server).get(`/establishments/${establishment_id1}`).then(res => {
          expect(res.status).toBe(200);
          expect(res.body.spacesInfo.map(x => x.enabled ? 1 : 0).reduce((a, b) => a+b)).toBe(1);
        });
      });

      test('disable space from wrong establishment should return 404', async () => {
        const spaceUpdateBody = {
          establishmentId: establishment_id2,
          enabled: false,
        };
        await request(server).put(`/establishments/space/${spaces1_ids[1]}`).send(spaceUpdateBody).then(res => {
          expect(res.status).toBe(404);
        });
      });

      test('disable non existent space return 404', async () => {
        const spaceUpdateBody = {
          establishmentId: establishment_id2,
          enabled: false,
        };
        await request(server).put(`/establishments/space/${establishment_id1}`).send(spaceUpdateBody).then(res => {
          expect(res.status).toBe(404);
        });
      });

      test('enable previously disabled space should return 201', async () => {
        const spaceUpdateBody = {
          establishmentId: establishment_id1,
          enabled: true,
        };
        await request(server).put(`/establishments/space/${spaces1_ids[0]}`).send(spaceUpdateBody).then(res => {
          expect(res.status).toBe(201);
        });
      });

      test('enabled previously disabled space should return enabled: true', async () => {
        await request(server).get(`/establishments/${establishment_id1}`).then(res => {
          expect(res.status).toBe(200);
          expect(res.body.spacesInfo.map(x => x.enabled ? 1 : 0).reduce((a, b) => a+b)).toBe(2);
        });
      });
    });
  });

  describe('visits', () => {
    const establishment = {
      type: type1,
      name: name1,
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
          entranceTimestamp: Date.now(),
          vaccinated: 0,
          covidRecovered: false
        };
        await request(server).post('/visits').send(visit).then(res => {
          expect(res.status).toBe(201);
        });
      });

      test('add second visit to the same space should return 201', async () => {
        const visit = {
          scanCode: spaces1_id[0],
          userGeneratedCode: "BNIUO1NT12NBF",
          entranceTimestamp: Date.now(),
          vaccinated: 0,
          covidRecovered: false
        };
        await request(server).post('/visits').send(visit).then(res => {
          expect(res.status).toBe(201);
        });
      });

      test('add visit with the same generated code to the same space should return 409', async () => {
        const visit = {
          scanCode: spaces1_id[0],
          userGeneratedCode: "QWER1234YUIO",
          entranceTimestamp: Date.now(),
          vaccinated: 0,
          covidRecovered: false
        };
        await request(server).post('/visits').send(visit).then(res => {
          expect(res.status).toBe(409);
        });
      });

      test('add visit with the same generated code to the other space should return 409', async () => {
        const visit = {
          scanCode: spaces1_id[1],
          userGeneratedCode: "QWER1234YUIO",
          entranceTimestamp: Date.now(),
          vaccinated: 0,
          covidRecovered: false
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
          entranceTimestamp: Date.now(),
          vaccinated: 0,
          covidRecovered: false
        };
        await request(server).post('/visits').send(visit).then(res => {
          expect(res.status).toBe(404);
        });
      });

      test('add first visit to the second space should return 201', async () => {
        const visit = {
          scanCode: spaces1_id[1],
          userGeneratedCode: "YUIOPHJK1234YUIO",
          entranceTimestamp: Date.now(),
          vaccinated: 0,
          covidRecovered: false
        };
        await request(server).post('/visits').send(visit).then(res => {
          expect(res.status).toBe(201);
        });
      });

      test('get visits to the second space should return 1 scan without exitTimestamp', async () => {
        await request(server).get(`/visits?scanCode=${spaces1_id[1]}`).then(res => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(1);
          expect(res.body[0].userGeneratedCode).toBe("YUIOPHJK1234YUIO");
          expect(res.body[0]).not.toHaveProperty('exitTimestamp')
        });
      });

      test('update visit with exit timestamp should return 201', async () => {
        const visit = {
          scanCode: spaces1_id[1],
          userGeneratedCode: "YUIOPHJK1234YUIO",
          exitTimestamp: Date.now(),
          vaccinated: 0,
          covidRecovered: false
        };
        await request(server).post('/visits/addExitTimestamp').send(visit).then(res => {
          expect(res.status).toBe(201);
        });
      });

      test('get visits to the second space should return 1 scan with exitTimestamp', async () => {
        await request(server).get(`/visits?scanCode=${spaces1_id[1]}`).then(res => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(1);
          expect(res.body[0].userGeneratedCode).toBe("YUIOPHJK1234YUIO");
          expect(res.body[0]).toHaveProperty('exitTimestamp')
        });
      });

      test('add visit to disabled space should return 404', async () => {
        const spaceUpdateBody = {
          establishmentId: establishment_id1,
          enabled: false,
        };
        await request(server).put(`/establishments/space/${spaces1_id[0]}`).send(spaceUpdateBody);
        const visit = {
          scanCode: `${spaces1_id[0]}`,
          userGeneratedCode: "POIQULNVOZZ",
          entranceTimestamp: Date.now(),
          vaccinated: 0,
          covidRecovered: false
        };
        await request(server).post('/visits').send(visit).then(res => {
          expect(res.status).toBe(404);
        });
      });
    });
  });
});
