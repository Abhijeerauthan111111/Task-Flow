require("dotenv").config();

const { getApp } = require("./app");

const PORT = Number(process.env.PORT || 4000);

getApp()
  .then((app) => {
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
