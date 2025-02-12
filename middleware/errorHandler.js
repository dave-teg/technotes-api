import { logEvents } from "./logger.js";

const errorHandler = (err, req, res, next) => {
  logEvents(`${err.name}\t${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
  console.log(err.stack)
  const status = res.statusCode ? res.statusCode : 500
  console.log(status) 

  return res.status(status).json({message: err.message, isError: true})
}

export default errorHandler