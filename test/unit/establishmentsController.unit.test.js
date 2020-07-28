const establishmentsControllerFactory = require('../../src/controllers/establishmentsController');

let req;
let res;
let next;

let id = 1;
let type = 'restaurant';
let name = 'Mc Donalds';
let email = 'mcdonalds@gmail.com';
let address = 'Cabildo 1010';
let city = 'CABA';
let province = 'CABA';
let zip = '1430ACV';
let country = 'Argentina';
let QRs = ['ASDF1234', 'QWER4563'];

beforeEach(() => {
  establishmentHandler = {
    findEstablishments: jest.fn(),
    findEstablishment: jest.fn(),
    establishmentExists: jest.fn(),
    addEstablishment: jest.fn(),
    updateEstablishment: jest.fn(),
    deleteEstablishment: jest.fn()
  };
  establishmentsController = establishmentsControllerFactory(establishmentHandler);
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

const exampleEstablishment = {
  id,
  type,
  name,
  email,
  address,
  city,
  province,
  zip,
  country,
  QRs
};

describe('get', () => {
  describe('when establishments are retrieved', () => {
    beforeEach(() => {
      req.query = { name };
      establishmentHandler.findEstablishments.mockResolvedValue([exampleEstablishment]);
    });

    test('should respond successfully', async () => {
      await establishmentsController.get(req, res, next);
      expect(establishmentHandler.findEstablishments).toHaveBeenCalledWith({name});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([exampleEstablishment]);
    });
  });
});

describe('getSingleEstablishment', () => {
  describe('when a establishment is retrieved', () => {
    beforeEach(() => {
      req.params = { establishmentId: id };
      establishmentHandler.findEstablishment.mockResolvedValue(exampleEstablishment);
    });

    test('should respond successfully', async () => {
      await establishmentsController.getSingleEstablishment(req, res, next);
      expect(establishmentHandler.findEstablishment).toHaveBeenCalledWith(id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(exampleEstablishment);
    });
  });

  describe('when an inexistent establishment is retrieved', () => {
    beforeEach(() => {
      req.params = { establishmentId: id };
      establishmentHandler.findEstablishment.mockResolvedValue(null);
    });

    test('should respond successfully', async () => {
      await establishmentsController.getSingleEstablishment(req, res, next);
      expect(establishmentHandler.findEstablishment).toHaveBeenCalledWith(id);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ reason: 'Establishment not found' });
    });
  });
});


describe('add', () => {
  describe('when a correct establishment is added', () => {
    beforeEach(() => {
      req.body = exampleEstablishment;
      establishmentHandler.establishmentExists.mockResolvedValue(null);
      establishmentHandler.addEstablishment.mockResolvedValue(exampleEstablishment);
    });

    test('should respond successfully', async () => {
      await establishmentsController.add(req, res, next);
      expect(establishmentHandler.establishmentExists).toHaveBeenCalledWith(exampleEstablishment);
      expect(establishmentHandler.addEstablishment).toHaveBeenCalledWith(exampleEstablishment);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: exampleEstablishment.id });
    });
  });

  describe('when a establishment is already registered', () => {
    beforeEach(() => {
      req.body = exampleEstablishment;
      establishmentHandler.establishmentExists.mockResolvedValue(exampleEstablishment);
    });

    test('should respond with conflict', async () => {
      await establishmentsController.add(req, res, next);
      expect(establishmentHandler.establishmentExists).toHaveBeenCalledWith(exampleEstablishment);
      expect(establishmentHandler.addEstablishment).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ reason: 'Establishment already registered' });
    });
  });

  describe('when there is a DB error', () => {
    beforeEach(() => {
      req.body = exampleEstablishment;
      establishmentHandler.establishmentExists.mockRejectedValue(new Error('crash!'));
    });

    test('should respond with internal error', async () => {
      await establishmentsController.add(req, res, next);
      expect(establishmentHandler.establishmentExists).toHaveBeenCalledWith(exampleEstablishment);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ reason: 'DB Error' });
    });
  });
});


describe('update', () => {
  const newData = {
    name,
    type
  };

  describe('when a establishment is correctly updated', () => {
    beforeEach(() => {
      req.params = { establishmentId: id };
      req.body = newData;
      establishmentHandler.updateEstablishment.mockResolvedValue({ n: 1 });
      establishmentHandler.findEstablishment.mockResolvedValue(exampleEstablishment);
    });

    test('should respond successfully', async () => {
      await establishmentsController.update(req, res, next);
      expect(establishmentHandler.updateEstablishment).toHaveBeenCalledWith(id, newData);
      expect(establishmentHandler.findEstablishment).toHaveBeenCalledWith(id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(exampleEstablishment);
    });
  });

  describe('when an inexisten establishment is updated', () => {
    beforeEach(() => {
      req.params = { establishmentId: id };
      req.body = newData;
      establishmentHandler.updateEstablishment.mockResolvedValue({ n: 0 });
    });

    test('should respond successfully', async () => {
      await establishmentsController.update(req, res, next);
      expect(establishmentHandler.updateEstablishment).toHaveBeenCalledWith(id, newData);
      expect(establishmentHandler.findEstablishment).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ reason: 'Establishment not found' });
    });
  });
});


describe('remove', () => {
  describe('when an existing establishment is removed', () => {
    beforeEach(() => {
      req.params = { establishmentId: id };
      establishmentHandler.deleteEstablishment.mockResolvedValue({ deletedCount: 1 });
    });

    test('should respond successfully', async () => {
      await establishmentsController.remove(req, res, next);
      expect(establishmentHandler.deleteEstablishment).toHaveBeenCalledWith(id);
      expect(res.status).toHaveBeenCalledWith(204);
    });
  });

  describe('when an inexisting establishment is removed', () => {
    beforeEach(() => {
      req.params = { establishmentId: id };
      establishmentHandler.deleteEstablishment.mockResolvedValue({ deletedCount: 0 });
    });

    test('should respond successfully', async () => {
      await establishmentsController.remove(req, res, next);
      expect(establishmentHandler.deleteEstablishment).toHaveBeenCalledWith(id);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ reason: 'Establishment not found' });
    });
  });
});
