module.exports = {
    getQRInfo: (establishmentName, spaceName, id, isExit) => ({
  title: `Establecimiento: ${establishmentName} \nEspacio: ${spaceName} (Entrada)`,
  code: { name: spaceName, id: id.toString(), isExit }
})
};
