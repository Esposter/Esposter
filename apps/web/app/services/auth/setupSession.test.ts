import { useSession } from "#src/services/auth/authClient.test";
import { beforeEach, describe } from "vitest";

// Signs one user in for every test of the suite that calls it, which is the session a store reads through useSession
export const setupSession = (userId: string) => {
  beforeEach(() => {
    useSession.mockReturnValue(ref({ data: { user: { id: userId } } }));
  });
};

describe.todo("setupSession");
