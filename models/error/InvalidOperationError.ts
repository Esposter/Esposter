import type { Operation } from "@/models/shared/Operation";

export class InvalidOperationError extends Error {
  constructor(operation: Operation, message?: string) {
    super(`Invalid operation: ${operation}${message ? `, ${message}` : ""}`);
    this.name = "InvalidOperationError";
  }
}
