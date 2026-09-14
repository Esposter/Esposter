import { RestError } from "@azure/core-rest-pipeline";

// Extends the real error class rather than mimicking its shape, so an `instanceof RestError` branch in the
// Code under test takes the same path it takes against the live service
export class MockRestError extends RestError {
  constructor(message: string, statusCode: number) {
    super(message, { statusCode });
    this.name = "MockRestError";
  }
}
