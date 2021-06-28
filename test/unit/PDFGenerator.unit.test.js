const fs = require('fs');
const path = require('path');
const PDFGenerator = require('../../src/services/PDFGenerator');
const util = require('util');

const existsPromise = util.promisify(fs.exists);
const mkdirPromise = util.promisify(fs.mkdir);
const rmdirPromise = util.promisify(fs.rmdir);

const code1 = "CodigoQRParaOli"
const code2 = "CodigoQRParaNacho"
const title1 = "QR de Oli"
const title2 = "QR de Nacho"
const testFilesDirectory = path.join(__dirname, "testFiles");
const pathQR = path.join(__dirname, "testFiles/qr1.png");
const pathPDF = path.join(__dirname, "testFiles/pdfGenerated.pdf");

const QRsInfo = [
  [title1, code1],
  [title2, code2],
]

beforeAll(async () => {
  if (!(await existsPromise(testFilesDirectory))) {
    await mkdirPromise(testFilesDirectory);
  }
});

afterAll(async () => {
  if (await existsPromise(testFilesDirectory)) {
    await new Promise(r => setTimeout(r, 1000));
    await rmdirPromise(testFilesDirectory);
  }
});

describe('PDF generator', () => {
  test('should generate a QR code', async () => {
    await PDFGenerator().generateQRCode(pathQR, code1);
    let file_exists = await existsPromise(pathQR);
    expect(file_exists).toBeTruthy();
    await PDFGenerator().deleteFile(pathQR);
    file_exists = await existsPromise(pathQR);
    expect(file_exists).toBeFalsy();
  });

  test('should generate a PDF with the QR codes', async () => {
    const buf = fs.createWriteStream(pathPDF);
    await PDFGenerator().generatePDF(buf, QRsInfo);
    let file_exists = await existsPromise(pathPDF);
    expect(file_exists).toBeTruthy();
    await PDFGenerator().deleteFile(pathPDF);
    file_exists = await existsPromise(pathPDF);
    expect(file_exists).toBeFalsy();
  });
});
