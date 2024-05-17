export class NotInitializedError<T extends string = string> extends Error {
  constructor(name: T) {
    super(`${name} is not initialized`);
    this.name = "NotInitializedError";
  }
}
