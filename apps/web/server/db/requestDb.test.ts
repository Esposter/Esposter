import { requestDatabase, requestDbStorage } from "#server/db/requestDb";
import { getWriteTopics, recordStatements } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import { getTableTopic, sessionsInAuth } from "@esposter/db-schema";
import { eq, getTableName } from "drizzle-orm";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe("requestDatabase", () => {
  test("a write the auth database makes inside a request is recorded on that request's handle", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const recorded = recordStatements(db);

    await requestDbStorage.run(recorded.database, () =>
      requestDatabase.delete(sessionsInAuth).where(eq(sessionsInAuth.token, v7())),
    );

    expect(recorded.statements).toHaveLength(1);
    await expect(getWriteTopics(recorded.statements)).resolves.toContain(getTableTopic(getTableName(sessionsInAuth)));
  });
});
