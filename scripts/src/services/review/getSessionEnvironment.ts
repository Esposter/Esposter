import { CLAUDE_EXEMPT_VARIABLE, SECRET_VARIABLE_REGEX } from "#src/services/review/constants";

// Every secret-shaped variable is dropped from the child, except the one that authenticates `claude` itself. A session
// Reads repository text it cannot trust, and `gh` is authenticated in the parent alone.
export const getSessionEnvironment = (): NodeJS.ProcessEnv =>
  Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => key === CLAUDE_EXEMPT_VARIABLE || !SECRET_VARIABLE_REGEX.test(String(key)),
    ),
  );
