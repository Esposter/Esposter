import type { Operation } from "@esposter/shared";

import { InvalidOperationError } from "@esposter/shared";

// A refused Blob Storage request, carrying the status it was refused with so a caller can branch on it
export class BlobStorageStatusError extends InvalidOperationError {
  override readonly name = "BlobStorageStatusError";
  readonly status: number;

  constructor(operation: Operation, name: string, status: number) {
    super(operation, name, `Blob Storage answered ${status}`);
    this.status = status;
  }
}
