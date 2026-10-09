import { parseMachineHeartbeat } from "#src/services/fleet/parseMachineHeartbeat";
import { describe, expect, test } from "vitest";

const HEARTBEAT = {
  at: Temporal.Instant.fromEpochMilliseconds(0).toString(),
  cpu: 12,
  freeMemory: 20.5,
  gpu: 3,
  machine: "pc",
};

describe(parseMachineHeartbeat, () => {
  test("reads a heartbeat with its gpu reading", () => {
    expect.hasAssertions();

    expect(parseMachineHeartbeat(JSON.stringify(HEARTBEAT))).toStrictEqual(HEARTBEAT);
  });

  test("reads a heartbeat without a gpu reading as one that measured none", () => {
    expect.hasAssertions();

    const withoutGpu = {
      at: HEARTBEAT.at,
      cpu: HEARTBEAT.cpu,
      freeMemory: HEARTBEAT.freeMemory,
      machine: HEARTBEAT.machine,
    };

    expect(parseMachineHeartbeat(JSON.stringify(withoutGpu))).toStrictEqual(withoutGpu);
  });

  test("reads a message with a missing or mistyped figure as no heartbeat", () => {
    expect.hasAssertions();

    expect(parseMachineHeartbeat(JSON.stringify({ ...HEARTBEAT, cpu: "12" }))).toBeUndefined();
    expect(parseMachineHeartbeat("{")).toBeUndefined();
  });
});
