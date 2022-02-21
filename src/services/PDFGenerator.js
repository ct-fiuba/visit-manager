module.exports = function PDFGenerator() {
  const QRCode = require('qrcode');
  const sharp = require('sharp');
  const PDFDocument = require('pdfkit');
  const fs = require('fs');
  const path = require('path');
  const util = require('util');

  const tmpQRDirectory = path.join(__dirname, "tmp");
  const logoDirectory = path.join(__dirname, '../../images/illness.png');
  const backgroundTemplateDirectory = path.join(__dirname, '../../images/backgroundTemplate.png');
  const unlinkPromise = util.promisify(fs.unlink);
  const existsPromise = util.promisify(fs.exists);
  const mkdirPromise = util.promisify(fs.mkdir);
  const rmdirPromise = util.promisify(fs.rmdir);
  const linesSize = 12;

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

  const generateQRFiles = async (QRsInfo) => {
    let counter = 1;
    let tmp_files = [];
    for (const element of QRsInfo) {
      let tmpQRFile = path.join(__dirname, "tmp/tmp" + counter + ".png");
      tmp_files.push({tmpFile: tmpQRFile, title: element.title, code: element.code});
      counter += 1;
    }
    let generateFilesPromises = tmp_files.map(x => generateQRCode(x.tmpFile, JSON.stringify(x.code)));
    await Promise.all(generateFilesPromises);
    return tmp_files;
  }

  const generatePDF = async (res, QRsInfo) => {
      if (!(await existsPromise(tmpQRDirectory))) {
        await mkdirPromise(tmpQRDirectory);
      }
      // Create a document
      const doc = new PDFDocument({ autoFirstPage: false, layout : 'landscape' });

      doc.pipe(res);

      const tmp_files = await generateQRFiles(QRsInfo);

      for (const x of tmp_files) {
        let tmpQRFile = x.tmpFile;
        let title = x.title;
        doc.addPage({ margin: 20, layout: 'landscape', size: 'A4' });

        doc.image(backgroundTemplateDirectory, {fit: [800, 650], align: 'left', valign: 'top'} );
        // Embed a font, set the font size, and render some text
        doc.fontSize(getTitleFontSize(title.length))
          .fillColor('white')
          .text(title, 50, getTitlePosition(title.length), { width: 450, height: 600 });

        // Add an image, constrain it to a given size, and center it vertically and horizontally
        doc.image(tmpQRFile, 500, 225, {
          fit: [300, 300],
          align: 'center',
          valign: 'center'
        });
      }

      let deletePromises = tmp_files.map(x => deleteFile(x.tmpFile));
      await Promise.all(deletePromises);
      await rmdirPromise(tmpQRDirectory);
      return doc.end();
  };

  const getTitleFontSize = (length) => {
    if (length >= linesSize * 2) {
      return 54;
    }
    return 74;
  }

  const getTitlePosition = (length) => {
    if (length <= linesSize * 1) {
      return 330;
    }
    if (length <= linesSize * 2) {
      return 290;
    }
    if (length <= linesSize * 3) {
      return 220;
    }
    return 270;
  }

  return {
    generateQRCode,
    generatePDF,
    deleteFile
  };
};
