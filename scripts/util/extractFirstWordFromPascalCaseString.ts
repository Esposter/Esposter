import { NotFoundError } from "esposter-shared/models/error/NotFoundError";

export const extractFirstWordFromPascalCaseString = (string: string) => {
  const match = string.match(/[A-Z][^A-Z]*/);
  if (!match) throw new NotFoundError(extractFirstWordFromPascalCaseString.name, string);
  return match[0];
};
