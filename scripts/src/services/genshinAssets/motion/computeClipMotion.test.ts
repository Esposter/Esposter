import type { DecodedClip } from "#src/models/genshinAssets/shared/DecodedClip";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { computeClipMotion } from "#src/services/genshinAssets/motion/computeClipMotion";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { crc32 } from "node:zlib";
import { describe, expect, test } from "vitest";

// A position curve per component of a path, its first and last samples the clip's start and stop
const createPositionCurve = (path: string, component: string, samples: number[]) => ({
  component,
  path,
  pathHash: crc32(path),
  property: "position",
  samples,
  type: AssetType.Transform,
});

describe(computeClipMotion, () => {
  test("a named clip's length, root translation and speed are read from its JSON", () => {
    expect.hasAssertions();

    // The root moves three metres along x and four along z, a length of five, over two seconds; its child moves ten
    // Along x but sits deeper in the hierarchy, so it is not the root
    const clip = parseMachineJson<DecodedClip>(
      JSON.stringify({
        curves: [
          createPositionCurve("Root", "x", [0, 3]),
          createPositionCurve("Root", "y", [0, 0]),
          createPositionCurve("Root", "z", [0, 4]),
          createPositionCurve("Root/Hip", "x", [0, 10]),
        ],
        duration: 2,
        name: "Ani_Animal_Fox_01_Scared",
      }),
    );

    expect(computeClipMotion(clip)).toStrictEqual({
      duration: 2,
      name: "Ani_Animal_Fox_01_Scared",
      rootTranslation: 5,
      speed: 2.5,
    });
  });

  test("a clip whose root holds still has no speed", () => {
    expect.hasAssertions();

    const clip: DecodedClip = {
      curves: [
        createPositionCurve("Root", "x", [0, 0]),
        createPositionCurve("Root", "y", [0, 0]),
        createPositionCurve("Root", "z", [0, 0]),
      ],
      duration: 2,
      name: "Ani_Animal_Fox_01_Idle",
    };

    expect(computeClipMotion(clip)).toStrictEqual({
      duration: 2,
      name: "Ani_Animal_Fox_01_Idle",
      rootTranslation: 0,
      speed: undefined,
    });
  });
});
