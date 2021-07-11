module.exports = {
    getQRInfo: (establishmentName, spaceName, id, isExit) => ({
  title: `Establecimiento: ${establishmentName} \nEspacio: ${spaceName} (Entrada)`,
  code: { name: establishmentName, space: spaceName, id: id.toString(), isExit }
})
};
