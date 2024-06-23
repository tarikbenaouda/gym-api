const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cors = require("cors");

const userRouter = require("./routes/userRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use(cors());
app.set("trust proxy", 1); // trust first proxy
// Limit requests from same API
const limiter = rateLimit({
  max: 20000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

app.use(express.json()); // To get access to req.body (express.json() is a middleware)
app.use(express.static(`${__dirname}/public`));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS(cross-site scripting)
app.use(xss());

// Prevent parameter pollution (hpp stands for http parameters pollution)
// app.use(
//   hpp({
//     whitelist: ['duration'],
//   }),
// );

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS(cross-site scripting)
app.use(xss());

// Routes
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server`, 404);
  next(err);
});

//Global Error handler (The last middleware on this app)
app.use(globalErrorHandler);
module.exports = app;
