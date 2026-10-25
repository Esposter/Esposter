import { InvalidOperationError, Operation } from "@esposter/shared";

export const readPair = (values: null | number[], vertex: number, name: string): [number, number] => {
  if (!values) throw new InvalidOperationError(Operation.Read, name, "the dome has no such texture coordinates");
  return [values[vertex * 2] ?? 0, values[vertex * 2 + 1] ?? 0];
};
