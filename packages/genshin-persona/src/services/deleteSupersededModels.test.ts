import { VOICE_MODEL_ID } from "#src/services/constants";
import { deleteSupersededModels } from "#src/services/deleteSupersededModels";
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(deleteSupersededModels, () => {
  const modelsDirectory = join(tmpdir(), `genshin-persona-${crypto.randomUUID()}`);
  const [currentOwner = "", currentRepository = ""] = VOICE_MODEL_ID.split("/");
  const supersededOwner = "supersededOwner";
  const supersededRepository = "supersededRepository";

  beforeEach(() => {
    for (const path of [
      join(modelsDirectory, currentOwner, currentRepository),
      join(modelsDirectory, currentOwner, supersededRepository),
      join(modelsDirectory, supersededOwner, supersededRepository),
    ])
      mkdirSync(path, { recursive: true });
  });

  afterEach(() => {
    rmSync(modelsDirectory, { force: true, recursive: true });
  });

  test("removes every checkpoint the model id no longer names, under its owner and under another", () => {
    expect.hasAssertions();

    deleteSupersededModels(modelsDirectory);

    expect(readdirSync(modelsDirectory)).toStrictEqual([currentOwner]);
    expect(readdirSync(join(modelsDirectory, currentOwner))).toStrictEqual([currentRepository]);
  });

  // The first load on a machine runs before anything has been downloaded, so the cache is not there to sweep
  test("sweeps a cache that does not exist yet", () => {
    expect.hasAssertions();

    expect(() => {
      deleteSupersededModels(join(modelsDirectory, supersededOwner, currentRepository));
    }).not.toThrow();
  });
});
