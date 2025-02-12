import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import fsPromises from "fs/promises";
import { format } from 'date-fns'
import { v4 as uuid} from 'uuid'

const currentFile = fileURLToPath(import.meta.url);
const dirname = path.dirname(currentFile);

export const logEvents = async (message, logFileName) => {
  const dateTime= format(new Date(), "yyyy-MM-dd HH:mm:ss");
  const logMsg = `${dateTime}\t${uuid()}\t${message}\n`;
  // console.log(logMsg)

  try {
    if (!fs.existsSync(path.join(dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(dirname, "..", "logs"))
    }
    await fsPromises.appendFile(path.join(dirname, "..", "logs", logFileName), logMsg)
  } catch (err) {
    console.error(err.stack);
  }
};

const logger = (req, res, next) => {
  const logMsg = `${req.method}\t${req.url}\t${req.headers.origin}`;
  logEvents(logMsg, 'reqLog.log');
  console.log(req.method, req.url)
  next()
}

export default logger
