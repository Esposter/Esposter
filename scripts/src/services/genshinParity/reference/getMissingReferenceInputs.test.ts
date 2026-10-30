import { MissingReferenceInputKind } from "#src/models/genshinParity/reference/MissingReferenceInputKind";
import { getMissingReferenceInputs } from "#src/services/genshinParity/reference/getMissingReferenceInputs";
import { describe, expect, test } from "vitest";

// Whether a path is on disk, given the paths that are
const onDisk =
  (...paths: string[]) =>
  (path: string) =>
    paths.includes(path);

describe(getMissingReferenceInputs, () => {
  const referencePath = "reference.png";
  const platePath = "plate.webp";
  const witnessLayoutPath = "witness.json";

  test("names nothing missing when the reference image, its plate and its witness layout are on disk", () => {
    expect.hasAssertions();

    expect(
      getMissingReferenceInputs(
        referencePath,
        platePath,
        witnessLayoutPath,
        onDisk(referencePath, platePath, witnessLayoutPath),
      ),
    ).toStrictEqual([]);
  });

  test("names the witness layout missing when the reference image is on disk", () => {
    expect.hasAssertions();

    expect(
      getMissingReferenceInputs(referencePath, platePath, witnessLayoutPath, onDisk(referencePath, platePath)),
    ).toStrictEqual([{ kind: MissingReferenceInputKind.WitnessLayout, path: witnessLayoutPath }]);
  });

  test("names the plate missing when the reference image is on disk, since a plate is a committed input like the image", () => {
    expect.hasAssertions();

    expect(getMissingReferenceInputs(referencePath, platePath, undefined, onDisk(referencePath))).toStrictEqual([
      { kind: MissingReferenceInputKind.Plate, path: platePath },
    ]);
  });

  test("names both inputs missing, the reference image first", () => {
    expect.hasAssertions();

    expect(getMissingReferenceInputs(referencePath, undefined, witnessLayoutPath, onDisk())).toStrictEqual([
      { kind: MissingReferenceInputKind.ReferenceImage, path: referencePath },
      { kind: MissingReferenceInputKind.WitnessLayout, path: witnessLayoutPath },
    ]);
  });

  test("checks no plate for a reference whose entry names no plate source, and no witness layout for one no component draws", () => {
    expect.hasAssertions();

    expect(getMissingReferenceInputs(referencePath, undefined, undefined, onDisk(referencePath))).toStrictEqual([]);
  });
});
