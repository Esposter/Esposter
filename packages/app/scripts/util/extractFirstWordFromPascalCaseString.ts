import { NotFoundError } from "@esposter/shared";

export const extractFirstWordFromPascalCaseString = (string: string) => {
  const match = /[A-Z][^A-Z]*/u.exec(string);
  if (!match) throw new NotFoundError(extractFirstWordFromPascalCaseString.name, string);
  return match[0];
};
