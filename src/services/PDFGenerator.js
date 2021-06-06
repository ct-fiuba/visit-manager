module.exports = function PDFGenerator() {
  const QRCode = require('qrcode');
  const PDFDocument = require('pdfkit');
  const fs = require('fs');
  const path = require('path');

  const tmpQRDirectory = path.join(__dirname, "tmp");

  const generateQRCode = async (filepath, code) => {
    try {
      await QRCode.toFile(filepath, code, {type: 'png', errorCorrectionLevel: 'H'});
    } catch (err) {
      console.error(err);
    }
  };

  const deleteFile = (filepath) => {
    fs.unlinkSync(filepath);
  }

  const generatePDF = async (res, QRsInfo) => {

    if (!fs.existsSync(tmpQRDirectory)){
      fs.mkdirSync(tmpQRDirectory);
    }

    // Create a document
    const doc = new PDFDocument({autoFirstPage:false});

    doc.pipe(res);

    let counter = 1;
    for (const element of QRsInfo) {
      let tmpQRFile = path.join(__dirname, "tmp/tmp" + counter + ".png");
      doc.addPage();
      // Embed a font, set the font size, and render some text
      doc.fontSize(24)
        .text(element[0], 100, 100, {align: 'center'});

      await generateQRCode(tmpQRFile, element[1]);

      // Add an image, constrain it to a given size, and center it vertically and horizontally
      doc.image(tmpQRFile, {
        fit: [450, 450],
        align: 'center',
        valign: 'center'
      });
      deleteFile(tmpQRFile);
      counter += 1;
    }
    fs.rmdirSync(tmpQRDirectory);
    return doc.end();
  };

  return {
    generateQRCode,
    generatePDF,
    deleteFile
  };
};
