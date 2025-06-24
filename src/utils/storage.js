export const getSessionStorage = (key) => {
  try {
    return JSON.parse(sessionStorage.getItem(key));
  } catch (e) {
    console.error('sessionStorage读取失败', e);
    return null;
  }
};

export const setSessionStorage = (key, value) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};
export const getLocalStorage = (key) => {
  return JSON.parse(localStorage.getItem(key))
};
// utils/storage.js
export const setLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};