// A mock error class that mimics the structure of Azure's RestError
// This allows you to test error handling more realistically.
export class MockRestError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "MockRestError";
    this.statusCode = statusCode;
  }
}
