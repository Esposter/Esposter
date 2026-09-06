/** Guard that `regex` still matches `source`, then rewrite the version it captured to `^${version}`. */
export const setVersion = (source: string, regex: RegExp, version: string, subject: string): string => {
  if (!regex.test(source)) throw new Error(`Could not find ${subject}`);

  return source.replace(regex, `$<lead>^${version}`);
};
