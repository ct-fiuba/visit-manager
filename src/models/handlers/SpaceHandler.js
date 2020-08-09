const Space = require('../schemas/Space');

module.exports = function SpaceHandler() {
  const findSpaces = async (query) => {
    return Space.find(query);
  };

  const findSpace = async (SpaceId) => {
    return Space.findOne({ _id: SpaceId });
  };

  const SpaceExists = async (content) => {
    return Space.findOne({ _id: content.id });
  };

  const addSpace = async (content) => {
    let newSpace = new Space(content);
    return newSpace.save();
  };

  const updateSpace = async (spaceId, content) => {
    let modifiedSpace = Space.updateOne({ _id: spaceId }, content);
    return modifiedSpace;
  };

  const deleteSpace = async (spaceId) => {
    return Space.deleteOne({ _id: spaceId });
  };

  return {
    findSpaces,
    findSpace,
    SpaceExists,
    addSpace,
    updateSpace,
    deleteSpace
  };
};
