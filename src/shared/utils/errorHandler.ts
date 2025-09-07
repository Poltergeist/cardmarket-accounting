import { logError, logWarn } from "./logger";

export class ErrorHandler {
  static handle(error: unknown, context: string): Error {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const processedError = new Error(`${context}: ${errorMessage}`);

    logError(`Error in ${context}`, {
      error: errorMessage,
      context,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return processedError;
  }

  static warn(message: string, context: string, data?: any): void {
    logWarn(message, {
      context,
      data,
    });
  }

  static logAndThrow(error: unknown, context: string): never {
    const processedError = this.handle(error, context);
    throw processedError;
  }
}
