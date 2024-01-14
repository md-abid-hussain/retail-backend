const { format } = require("date-fns");
const { v4: uuid } = require("uuid");
const path = require("path");
const fs = require("fs");
const fsPromise = require("fs").promises;

const logEvents = async (message, logFile) => {
  const datetime = `${format(new Date(), "dd-MM-yyyy\tHH:mm:ss")}`;
  const logItem = `${datetime}\t${uuid()}\t${message}`;

  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs")))
      await fsPromise.mkdir(path.join(__dirname, "..", "logs"));
    await fsPromise.appendFile(
      path.join(__dirname, "..", "logs", logFile),
      logItem
    );
  } catch (err) {
    console.error(err);
  }
};

const logger = (req, res, next) => {
  logEvents(`${req.method}\t${req.get("origin")}\t${req.url}`, "reqLog.txt");
  console.log(`${req.method} ${req.path}`);
  next();
};

module.exports = { logger, logEvents };
