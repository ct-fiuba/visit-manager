const fs = require('fs');
const path = require('path');
const PDFGenerator = require('../../src/services/PDFGenerator');

const code1 = "CodigoQRParaOli"
const code2 = "CodigoQRParaNacho"
const title1 = "QR de Oli"
const title2 = "QR de Nacho"
const testFilesDirectory = path.join(__dirname, "testFiles");
const pathQR = path.join(__dirname, "testFiles/qr1.png");
const pathPDF = path.join(__dirname, "testFiles/pdfGenerated.pdf");

const QRsInfo = [
  {name: title1, id: code1 },
  {name: title2, id: code2 },
]

beforeAll(async () => {
  if (!fs.existsSync(testFilesDirectory)){
    fs.mkdirSync(testFilesDirectory);
  }
});

afterAll(async () => {
  if (fs.existsSync(testFilesDirectory)){
    fs.rmdirSync(testFilesDirectory);
  }
});

describe('PDF generator', () => {
  test('should generate a QR code', async () => {
    await PDFGenerator().generateQRCode(pathQR, JSON.stringify(QRsInfo[0]));
    expect(fs.existsSync(pathQR)).toBeTruthy();
    PDFGenerator().deleteFile(pathQR);
    expect(fs.existsSync(pathQR)).toBeFalsy();
  });

  test('should generate a PDF with the QR codes', async () => {
    const buf = fs.createWriteStream(pathPDF);
    await PDFGenerator().generatePDF(buf, QRsInfo);
    expect(fs.existsSync(pathPDF)).toBeTruthy();
    PDFGenerator().deleteFile(pathPDF);
    expect(fs.existsSync(pathPDF)).toBeFalsy();
  });
});
