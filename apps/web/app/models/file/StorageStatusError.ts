import type { Operation } from "@esposter/shared";

import { InvalidOperationError } from "@esposter/shared";

// A refused storage request, carrying the status it was refused with so a caller can branch on it
export class StorageStatusError extends InvalidOperationError {
  override readonly name = "StorageStatusError";
  readonly status: number;

  constructor(operation: Operation, name: string, status: number) {
    super(operation, name, `Storage answered ${status}`);
    this.status = status;
  }
}
