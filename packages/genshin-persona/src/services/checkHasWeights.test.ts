import { checkHasWeights } from "#src/services/checkHasWeights";
import { VOICE_MODEL_DTYPE, VOICE_MODEL_ID } from "#src/services/constants";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(checkHasWeights, () => {
  const modelsDirectory = join(tmpdir(), `genshin-persona-${crypto.randomUUID()}`);
  const onnxDirectory = join(modelsDirectory, VOICE_MODEL_ID, "onnx");
  const graphPaths = Object.entries(VOICE_MODEL_DTYPE).map(([component, dtype]) =>
    join(onnxDirectory, `${component}_${dtype}.onnx`),
  );

  beforeEach(() => {
    mkdirSync(onnxDirectory, { recursive: true });
    for (const path of graphPaths) writeFileSync(path, "");
  });

  afterEach(() => {
    rmSync(modelsDirectory, { force: true, recursive: true });
  });

  test("holds the weights once every declared variant's graph is cached", () => {
    expect.hasAssertions();

    expect(checkHasWeights(modelsDirectory)).toBe(true);
  });

  // A download the verb was stopped in leaves the graphs before it and not the one it was on
  test("lacks the weights while one declared variant's graph is missing", () => {
    expect.hasAssertions();

    const [graphPath = ""] = graphPaths;
    rmSync(graphPath);

    expect(checkHasWeights(modelsDirectory)).toBe(false);
  });

  test("lacks the weights in a cache that does not exist yet", () => {
    expect.hasAssertions();

    expect(checkHasWeights(join(modelsDirectory, "missing"))).toBe(false);
  });
});
