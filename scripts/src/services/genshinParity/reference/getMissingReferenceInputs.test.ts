import { getMissingReferenceInputs } from "#src/services/genshinParity/reference/getMissingReferenceInputs";
import { describe, expect, test } from "vitest";

// Whether a path is on disk, given the paths that are
const onDisk =
  (...paths: string[]) =>
  (path: string) =>
    paths.includes(path);

describe(getMissingReferenceInputs, () => {
  const referencePath = "reference.png";
  const witnessLayoutPath = "witness.json";

  test("names nothing missing when the reference image and its witness layout are on disk", () => {
    expect.hasAssertions();

    expect(
      getMissingReferenceInputs(referencePath, witnessLayoutPath, onDisk(referencePath, witnessLayoutPath)),
    ).toStrictEqual([]);
  });

  test("names the witness layout missing when the reference image is on disk", () => {
    expect.hasAssertions();

    expect(getMissingReferenceInputs(referencePath, witnessLayoutPath, onDisk(referencePath))).toStrictEqual([
      `witness layout at ${witnessLayoutPath}`,
    ]);
  });

  test("names both inputs missing, the reference image first", () => {
    expect.hasAssertions();

    expect(getMissingReferenceInputs(referencePath, witnessLayoutPath, onDisk())).toStrictEqual([
      `reference image at ${referencePath}`,
      `witness layout at ${witnessLayoutPath}`,
    ]);
  });

  test("checks no witness layout for a reference no component draws", () => {
    expect.hasAssertions();

    expect(getMissingReferenceInputs(referencePath, undefined, onDisk(referencePath))).toStrictEqual([]);
  });
});
