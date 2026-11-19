// The rows of a statement as the driver reads them: one at a time, or whole
export interface MockObjectCursor {
  next: () => IteratorResult<unknown>;
  toArray: () => unknown[];
}
