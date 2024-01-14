const { logEvents } = require("./logEvent");

const errorHandler = (err, req, res, next) => {
  logEvents(`${err.name}\t${err.message}`, "errorLog.txt");
  console.log(err.stack);

  const status = res.statusCode ? res.statusCode : 500;

  res.status(status);

  res.json({ message: err.message, isError: true });
};

module.exports = errorHandler;
