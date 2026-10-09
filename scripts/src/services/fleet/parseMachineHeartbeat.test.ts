import { parseMachineHeartbeat } from "#src/services/fleet/parseMachineHeartbeat";
import { describe, expect, test } from "vitest";

const HEARTBEAT = {
  at: Temporal.Instant.fromEpochMilliseconds(0).toString(),
  cpu: 12,
  freeMemory: 20.5,
  gpu: 3,
  machine: "pc",
  platform: "win32",
};

describe(parseMachineHeartbeat, () => {
  test("reads a heartbeat with its gpu reading and platform", () => {
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
      platform: HEARTBEAT.platform,
    };

    expect(parseMachineHeartbeat(JSON.stringify(withoutGpu))).toStrictEqual(withoutGpu);
  });

  test("reads a heartbeat without a platform, as one an older watcher pushed", () => {
    expect.hasAssertions();

    const withoutPlatform = {
      at: HEARTBEAT.at,
      cpu: HEARTBEAT.cpu,
      freeMemory: HEARTBEAT.freeMemory,
      gpu: HEARTBEAT.gpu,
      machine: HEARTBEAT.machine,
    };

    expect(parseMachineHeartbeat(JSON.stringify(withoutPlatform))).toStrictEqual(withoutPlatform);
  });

  test("reads a message with a missing or mistyped field as no heartbeat", () => {
    expect.hasAssertions();

    expect(parseMachineHeartbeat(JSON.stringify({ ...HEARTBEAT, cpu: "12" }))).toBeUndefined();
    expect(parseMachineHeartbeat(JSON.stringify({ ...HEARTBEAT, platform: 3 }))).toBeUndefined();
    expect(parseMachineHeartbeat("{")).toBeUndefined();
  });
});
