import type { Operation } from "@/models/shared/Operation";

export class InvalidOperationError extends Error {
  constructor(operation: Operation, name: string, message: string) {
    super(`Invalid operation: ${operation}, name: ${name}, ${message}`);
    this.name = "InvalidOperationError";
  }
}
