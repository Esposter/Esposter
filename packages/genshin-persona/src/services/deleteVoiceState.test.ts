import { connectVoiceServer } from "#src/services/connectVoiceServer";
import { VIEWER_PATH } from "#src/services/constants";
import { deleteVoiceState } from "#src/services/deleteVoiceState";
import { rmSync } from "node:fs";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/connectVoiceServer"), () => ({ connectVoiceServer: vi.fn() }));
vi.mock(import("node:fs"), () => ({ rmSync: vi.fn() }));

describe(deleteVoiceState, () => {
  test("Teardown removes the viewer setup", async () => {
    expect.hasAssertions();

    await deleteVoiceState();

    expect(connectVoiceServer).toHaveBeenCalledOnce();
    expect(rmSync).toHaveBeenCalledWith(VIEWER_PATH, expect.objectContaining({ force: true }));
  });
});
