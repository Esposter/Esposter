import { InvalidOperationError, Operation } from "@esposter/shared";
/** Guard that `regex` still matches `source`, then rewrite the version it captured to `^${version}`. */
export const setVersion = (source: string, regex: RegExp, version: string, subject: string): string => {
  if (!regex.test(source))
    throw new InvalidOperationError(Operation.Update, setVersion.name, `Could not find ${subject}`);

  return source.replace(regex, `$<lead>^${version}`);
};
