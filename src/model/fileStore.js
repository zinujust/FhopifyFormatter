let fileStorage = {
  icaps: null,
  ecdb: null,
  images: null,
  hierarchy: null,
};

export const setIcaps = (data) => {
  fileStorage.icaps = data;
};

export const setEcdb = (data) => {
  fileStorage.ecdb = data;
};

export const setImages = (data) => {
  fileStorage.images = data;
};

export const getIcaps = () => {
  return fileStorage.icaps;
};

export const getEcdb = () => {
  return fileStorage.ecdb;
};

export const getImages = () => {
  return fileStorage.images;
};

export const getFileStorage = () => {
  return fileStorage;
};

export const setHierarchy = (data) => {
  fileStorage.hierarchy = data;
};

export const getHierarchy = () => {
  return fileStorage.hierarchy;
};
