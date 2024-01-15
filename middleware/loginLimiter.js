const rateLimit = require("express-rate-limit");
const { logEvents } = require("./logEvent");

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // Limit each IP to 5 login per 'window' per minute
  message: {
    message:
      "Too many login attempts from this IP, please try after a 60 second pause",
  },
  handler: (req, res, next, options) => {
    logEvents(
      `Too many requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      "errlog.log"
    );
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true, // Return rate limit info in the 'RateLimit-*' headers
  legacyHeaders: false, // Disable the 'x-RateLimit-*' headers
});

module.exports = loginLimiter;
