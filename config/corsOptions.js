import allowedOrigins from "./allowedOrigins.js";

const corsOptions = {
  origin: (origin, callback) => {
    if(allowedOrigins.indexOf(origin) !== -1) { // apply the origin only if you want allow post man
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'), false)
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}

export default corsOptions