import dotenv from "dotenv";
dotenv.config();
const ErrorHandler = (err, req, res, next) => {
  console.log("Middleware Error Handling:", err.message, err.statusCode);
  const errStatus = err.statusCode || 500;
  const errMsg = err.message || "Internal Server Error";
  res.status(errStatus).json({
    success: false,
    status: errStatus,
    message: errMsg,
    stack: process.env.NODE_ENV === "development" ? err.stack : {},
  });
};

export default ErrorHandler;
