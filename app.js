require("dotenv").config();
require("express-async-errors");

// extra security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

const path = require("path");
const express = require("express");
const favicon = require("serve-favicon");
const logger = require("morgan");

const connectDB = require("./db/connect");
const authenticateUser = require("./middleware/authentication");

const storiesRouter = require("./routes/stories");
const authRouter = require("./routes/auth");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

const app = express();
app.use(express.json());
app.set("trust proxy", 1);

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 100,
  })
);
// app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "data:", "https://res.cloudinary.com"],
      "style-src": ["'self'", "https://cdnjs.cloudflare.com", "'unsafe-inline'"],
      "script-src": ["'self'", "https://cdnjs.cloudflare.com"],
    },
  })
);
app.use(cors());
app.use(xss());

// routes
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public/img", "favicon.ico")));
app.use(logger("dev"));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/stories", authenticateUser, storiesRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.error(error);
  }
};

start();
