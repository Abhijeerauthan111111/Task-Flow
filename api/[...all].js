const { getApp } = require("../server/src/app");

let appPromise;

module.exports = async (req, res) => {
  if (!appPromise) appPromise = getApp();
  const app = await appPromise;
  return app(req, res);
};

