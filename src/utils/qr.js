module.exports = {
    getQRInfo: (establishmentName, spaceName, id, isExit, estimatedVisitDuration) => ({
  title: `${spaceName} (${isExit ? 'Salida' : 'Entrada'})`,
  code: { name: establishmentName, space: spaceName, id: id.toString(), isExit, estimatedVisitDuration }
})
};
