import { CALL_REGEX, DESTRUCTURE_REGEX } from "#src/services/sweeps/staleNames/constants";

export const getCitedNames = (token: string): string[] => {
  const names = DESTRUCTURE_REGEX.exec(token)?.groups?.names;
  if (names === undefined) return [CALL_REGEX.exec(token)?.groups?.callee ?? token];
  else return names.split(",").map((name) => name.trim());
};
