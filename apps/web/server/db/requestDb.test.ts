import { requestDatabase, requestDbStorage } from "#server/db/requestDb";
import { getWriteTopics, recordStatements } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import { getTableTopic, sessionsInAuth, usersInAuth } from "@esposter/db-schema";
import { eq, getTableName } from "drizzle-orm";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe("requestDatabase", () => {
  test("a write the auth database makes inside a request is recorded on that request's handle", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const userId = v7();
    const token = v7();
    await db.insert(usersInAuth).values({ email: "email", emailVerified: false, id: userId, name: "name" });
    await db.insert(sessionsInAuth).values({ expiresAt: new Date(0), id: v7(), token, userId });
    // A write names its table only when it changes a row, so the session it deletes is seeded first
    const recorded = recordStatements(db);

    await requestDbStorage.run(recorded.database, () =>
      requestDatabase.delete(sessionsInAuth).where(eq(sessionsInAuth.token, token)),
    );

    expect(recorded.statements).toHaveLength(1);
    await expect(getWriteTopics(recorded.statements)).resolves.toContainEqual({
      topic: getTableTopic(getTableName(sessionsInAuth)),
    });
  });
});
