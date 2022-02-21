module.exports = {
    getQRInfo: (establishmentName, spaceName, id, hasExit, isExit, estimatedVisitDuration) => ({
  title: `${spaceName.length > 40 ? spaceName.substring(0,40) + '...' : spaceName} ${hasExit ? (isExit ? '(Salida)' : '(Entrada)') : ''}`,
  code: { name: establishmentName, space: spaceName, id: id.toString(), isExit, estimatedVisitDuration }
})
};
