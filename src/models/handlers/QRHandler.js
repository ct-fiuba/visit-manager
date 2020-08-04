const QR = require('../schemas/QR');

module.exports = function QRHandler() {
  const findQRs = async (query) => {
    return QR.find(query);
  };

  const findQR = async (QRId) => {
    return QR.findOne({ _id: QRId });
  };

  const QRExists = async (content) => {
    return QR.findOne({ _id: content.id });
  };

  const addQR = async (content) => {
    let newQR = new QR(content);
    return newQR.save();
  };

  const updateQR = async (QRId, content) => {
    let modifiedQR = QR.updateOne({ _id: QRId }, content);
    return modifiedQR;
  };

  const deleteQR = async (QRId) => {
    return QR.deleteOne({ _id: QRId });
  };

  return {
    findQRs,
    findQR,
    QRExists,
    addQR,
    updateQR,
    deleteQR
  };
};
