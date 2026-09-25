import { TOKEN_BYTE_LENGTH, TOKEN_DIRECTORY_NAME, TOKEN_FILENAME } from "#src/services/server/constants";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// The token every connection must present, made once and kept in the person's home directory, readable by them
// Alone. Deleting or emptying the file revokes every paired page on the next start.
export const readToken = (): string => {
  const tokenDirectory = join(homedir(), TOKEN_DIRECTORY_NAME);
  const tokenPath = join(tokenDirectory, TOKEN_FILENAME);
  const storedToken = existsSync(tokenPath) ? readFileSync(tokenPath, "utf8").trim() : "";
  if (storedToken) return storedToken;

  const token = randomBytes(TOKEN_BYTE_LENGTH).toString("base64url");
  mkdirSync(tokenDirectory, { recursive: true });
  // `mode` applies only to a file the write creates, so an emptied file is removed first rather than written into
  // With whatever permissions it was left
  rmSync(tokenPath, { force: true });
  writeFileSync(tokenPath, token, { mode: 0o600 });
  return token;
};
