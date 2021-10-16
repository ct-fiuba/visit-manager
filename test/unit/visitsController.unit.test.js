const visitsControllerFactory = require('../../src/controllers/visitsController');

let req;
let res;
let next;

let _id = 1;
let scanCode = 'ASDF1234';
let userGeneratedCode = 'QWER456309852';
let entranceTimestamp = Date.now();

beforeEach(() => {
  visitHandler = {
    findVisits: jest.fn(),
    visitExists: jest.fn(),
    spaceExists: jest.fn(),
    addVisit: jest.fn()
  };
  visitsController = visitsControllerFactory(visitHandler);
  req = {
    body: {},
    params: {},
    query: {}
  };
  res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
    json: jest.fn()
  };
  next = jest.fn();
});

const exampleVisit = {
  _id,
  scanCode,
  userGeneratedCode,
  entranceTimestamp,
};

describe('get', () => {
  describe('when visits are retrieved', () => {
    beforeEach(() => {
      req.query = { userGeneratedCode };
      visitHandler.findVisits.mockResolvedValue([exampleVisit]);
    });

    test('should respond successfully', async () => {
      await visitsController.get(req, res, next);
      expect(visitHandler.findVisits).toHaveBeenCalledWith({userGeneratedCode});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([exampleVisit]);
    });
  });
});

describe('add', () => {
  describe('when a correct visit is added', () => {
    beforeEach(() => {
      req.body = exampleVisit;
      visitHandler.visitExists.mockResolvedValue(null);
      visitHandler.spaceExists.mockResolvedValue({
        name: "Primer piso",
        hasExit: true,
        m2: "1000",
        estimatedVisitDuration: "60",
        openSpace: false,
        n95Mandatory: false,
        enabled: true
      });
      visitHandler.addVisit.mockResolvedValue(exampleVisit);
    });

    test('should respond successfully', async () => {
      await visitsController.add(req, res, next);
      expect(visitHandler.visitExists).toHaveBeenCalledWith(exampleVisit);
      expect(visitHandler.spaceExists).toHaveBeenCalledWith(exampleVisit.scanCode);
      expect(visitHandler.addVisit).toHaveBeenCalledWith(exampleVisit);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ _id: exampleVisit._id });
    });
  });

  describe('when a visit is already registered', () => {
    beforeEach(() => {
      req.body = exampleVisit;
      visitHandler.visitExists.mockResolvedValue(exampleVisit);
    });

    test('should respond with conflict', async () => {
      await visitsController.add(req, res, next);
      expect(visitHandler.visitExists).toHaveBeenCalledWith(exampleVisit);
      expect(visitHandler.addVisit).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ reason: 'Visit already registered' });
    });
  });

  describe('when there is a DB error', () => {
    beforeEach(() => {
      req.body = exampleVisit;
      visitHandler.visitExists.mockRejectedValue(new Error('crash!'));
    });

    test('should respond with internal error', async () => {
      await visitsController.add(req, res, next);
      expect(visitHandler.visitExists).toHaveBeenCalledWith(exampleVisit);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ reason: 'DB Error' });
    });
  });
});
