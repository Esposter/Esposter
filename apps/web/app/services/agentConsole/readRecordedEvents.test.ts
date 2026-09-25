import type { AgentEvent } from "agent-console-server/contracts";

import { agentEventSchema } from "agent-console-server/contracts";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { describe } from "vitest";

// The events one real Claude Code session produced through the host, as the host's own mapper test records them —
// Read through the contract, so a fixture the wire would reject never reaches a test here
export const readRecordedEvents = (): AgentEvent[] => {
  const packageDirectory = dirname(createRequire(import.meta.url).resolve("agent-console-server/package.json"));
  const eventsPath = join(
    packageDirectory,
    "src/services/drivers/claudeAgentSdk/__snapshots__/recordedSession.events.json",
  );
  // oxlint-disable-next-line no-restricted-properties -- the event schema validates the fixture and coerces its dates
  return agentEventSchema.array().parse(JSON.parse(readFileSync(eventsPath, "utf8")));
};

describe.todo("readRecordedEvents");
