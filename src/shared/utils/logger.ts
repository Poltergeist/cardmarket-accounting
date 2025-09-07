import pino from "pino";

// Create logger instance with pretty formatting for development
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      ignore: "pid,hostname",
      translateTime: "SYS:standard",
    },
  },
});

// Helper function to log with structured data
export const logInfo = (message: string, data?: any) => {
  logger.info(data, message);
};

export const logError = (message: string, data?: any) => {
  logger.error(data, message);
};

export const logWarn = (message: string, data?: any) => {
  logger.warn(data, message);
};

export default logger;
