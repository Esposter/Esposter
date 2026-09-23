import { toSlashCommand } from "@/services/agentConsole/toSlashCommand";
import { CommandType } from "agent-console-server/contracts";
import { describe, expect, test } from "vitest";

describe(toSlashCommand, () => {
  const sessionId = crypto.randomUUID();

  test("reads a leading slash as the command it names and the rest as its arguments", () => {
    expect.hasAssertions();

    expect(toSlashCommand(sessionId, "/a b c")).toStrictEqual({
      arguments: "b c",
      name: "a",
      sessionId,
      type: CommandType.SlashCommand,
    });
    expect(toSlashCommand(sessionId, "a")).toBeUndefined();
    expect(toSlashCommand(sessionId, "/")).toBeUndefined();
  });
});
