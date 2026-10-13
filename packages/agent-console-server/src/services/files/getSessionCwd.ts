import type { Driver } from "#src/models/driver/Driver";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The working directory a session was opened in, which is where its files are listed and read from
export const getSessionCwd = async (driver: Driver, sessionId: string): Promise<string> => {
  const session = (await driver.listSessions()).find(({ id }) => id === sessionId);
  if (!session) throw new InvalidOperationError(Operation.Read, sessionId, "the session is not open on this host");
  return session.cwd;
};
