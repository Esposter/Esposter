import { getMockContainer } from "#src/services/container/getMockContainer";
import { MockContainerDatabase } from "#src/store/MockContainerDatabase";
import { afterEach, describe, expect, test } from "vitest";

describe(getMockContainer, () => {
  afterEach(() => {
    MockContainerDatabase.clear();
  });

  // Every client built for a container name has to reach the same blob map, or a write through one client is
  // Invisible to the next — the helper owns that identity, so it is the thing worth pinning
  test("returns the same map for the same container name", () => {
    expect.hasAssertions();

    expect(getMockContainer("containerName")).toBe(getMockContainer("containerName"));
  });

  test("returns a separate map per container name", () => {
    expect.hasAssertions();

    expect(getMockContainer("containerName")).not.toBe(getMockContainer("otherContainerName"));
  });
});
