export class NotFoundError<T extends string = string> extends Error {
  constructor(name: T, id: string) {
    super(`${name} is not found for id: ${id}`);
    this.name = "NotFoundError";
  }
}
