import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/root.js";
import logger, {logEvents} from "./middleware/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import corsOptions from "./config/corsOptions.js";
import mongoose from "mongoose";
import connectDB from "./config/dbConn.js";
import userRouter from "./routes/userRoute.js"
import noteRouter from "./routes/noteRoute.js"
import authRouter from "./routes/authRoute.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3500;

const currentFile = fileURLToPath(import.meta.url);
const dirname = path.dirname(currentFile);

//connect to db
connectDB()

// custom middleware for logging requests
app.use(logger);

// cors middleware to only allow certain origins to access the api
app.use(cors(corsOptions));

//middleware to parse json data
app.use(express.json());

//middleware to parse cookies
app.use(cookieParser());

//to serve static files like css
app.use("/", express.static(path.join(dirname, "public")));

//routes
app.use("/", router);
app.use("/users", userRouter)
app.use("/notes", noteRouter)
app.use("/auth", authRouter)


// catch all for a 404
app.use((req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 not found" });
  } else {
    res.type("txt").send("404 not found");
  }
});

//error handler
app.use(errorHandler);

//listen to connection to the mongodb for the first time
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB')
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
})

// listen to mongo connection error and log it
mongoose.connection.on('error', (err) => {
  console.log(err);
  logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})

