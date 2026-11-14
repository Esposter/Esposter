import { InvalidOperationError, Operation } from "@esposter/shared";

// A header the answer must carry: an answer without it is a malformed one, so it throws rather than reading as a zero
export const readR2Header = (response: Response, header: string, operation: Operation, name: string): string => {
  const value = response.headers.get(header);
  if (value === null) throw new InvalidOperationError(operation, name, `answered without a ${header} header`);
  return value;
};
