import { rateLimit } from "express-rate-limit";
import { logEvents } from "./logger.js";

const loginLimiter = rateLimit({
  windowMs: 10 * 6 * 1000, //10min
  limit: 5, // limit each IP to 5 login attempts per 10min
  message: {
    message:
      "Too many login attempts from this IP, please try again after a 10min pause.",
  },
  handler: (req, res, next, options) => {
    logEvents(
      `Too many requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      "errLog.log"
    );
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true, // Return rate limit info in the "RateLimit-*" headers
  legacyHeaders: false, // Disable the "X-RateLimit-*" headers
});

export default loginLimiter;
