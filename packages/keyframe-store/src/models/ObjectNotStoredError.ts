import { InvalidOperationError, Operation } from "@esposter/shared";

// The one read failure that is not corruption. Objects are collected the moment no record names them, so a
// Caller still holding a version's record — a listing taken before a sweep, a link somebody kept — can ask for
// Bytes that are legitimately gone. That is an absent version rather than a broken one, and separating it from
// A truncated or mismatched object is what lets a caller answer with a 404 without swallowing real corruption.
export class ObjectNotStoredError extends InvalidOperationError {
  constructor(hash: string, message: string) {
    super(Operation.Read, hash, message);
    this.name = "ObjectNotStoredError";
  }
}
