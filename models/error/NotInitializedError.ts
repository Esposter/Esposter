export class NotInitializedError extends Error {
  constructor(name: string) {
    super(`${name} is not initialized`);
    this.name = "NotInitializedError";
  }
}
