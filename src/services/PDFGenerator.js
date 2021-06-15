module.exports = function PDFGenerator() {
  const QRCode = require('qrcode');
  const sharp = require('sharp');
  const PDFDocument = require('pdfkit');
  const fs = require('fs');
  const path = require('path');
  const util = require('util');

  const tmpQRDirectory = path.join(__dirname, "tmp");
  const logoDirectory = path.join(__dirname, '../../images/covid.png');
  const unlinkPromise = util.promisify(fs.unlink);
  const existsPromise = util.promisify(fs.exists);
  const mkdirPromise = util.promisify(fs.mkdir);
  const rmdirPromise = util.promisify(fs.rmdir);

  const generateQRCode = async (filepath, code) => {
    return new Promise(async (res, rej) => {
      const tempfilepath = `${filepath.slice(0, -4)}_no_logo.png`;
      await QRCode.toFile(tempfilepath, code, { type: 'png', errorCorrectionLevel: 'H', width: 350, scale: 1 });
      await sharp(tempfilepath)
        .composite([{ input: logoDirectory }])
        .toFile(filepath);
      await deleteFile(tempfilepath);
      res(true);
    });
  }

  const deleteFile = async (filepath) => {
    return await unlinkPromise(filepath);
  }

  const generatePDF = async (res, QRsInfo) => {
    return (async () => {
      if (!(await existsPromise(tmpQRDirectory))) {
        await mkdirPromise(tmpQRDirectory);
      }
      // Create a document
      const doc = new PDFDocument({ autoFirstPage: false });

      doc.pipe(res);

      let counter = 1;
      let tmp_files = [];
      for (const element of QRsInfo) {
        let tmpQRFile = path.join(__dirname, "tmp/tmp" + counter + ".png");
        tmp_files.push([tmpQRFile, element[0], element[1]]);
        counter += 1;
      }
      let generateFilesPromises = tmp_files.map(x => generateQRCode(x[0], x[2]));
      await Promise.all(generateFilesPromises);
      for (const x of tmp_files) {
        let tmpQRFile = x[0];
        let title = x[1];
        doc.addPage();
        // Embed a font, set the font size, and render some text
        doc.fontSize(24)
          .text(title, 100, 100, { align: 'center' });

        // Add an image, constrain it to a given size, and center it vertically and horizontally
        doc.image(tmpQRFile, {
          fit: [440, 350],
          align: 'center',
          valign: 'center'
        });
      }

      let deletePromises = tmp_files.map(x => deleteFile(x[0]));
      await Promise.all(deletePromises);
      await rmdirPromise(tmpQRDirectory);
      return doc.end();
    })()
  };

  return {
    generateQRCode,
    generatePDF,
    deleteFile
  };
};
