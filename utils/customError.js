class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}
let createCustomError = (message, statusCode) =>
  new CustomError(message, statusCode);

export { CustomError, createCustomError };
