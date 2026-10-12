import type { GoSource } from "#src/models/genshinAssets/kits/gcsim/GoSource";

import { readGcsimAnimationFrameNames } from "#src/services/genshinAssets/kits/gcsim/readGcsimAnimationFrameNames";
import { describe, expect, test } from "vitest";

describe(readGcsimAnimationFrameNames, () => {
  test("reads an ability's frames from its AnimationLength, followed through an alias and past a sum", () => {
    expect.hasAssertions();

    const sources: GoSource[] = [
      {
        path: "skill.go",
        source: [
          "package freminet",
          "",
          "func (c *char) skill() {",
          "\tcancels := skillThrustFrames",
          "\treturn action.Info{",
          "\t\tAnimationLength: cancels[action.InvalidAction],",
          "\t}",
          "}",
        ].join("\n"),
      },
      {
        path: "burst.go",
        source: [
          "package heizou",
          "",
          "func (c *char) burst() {",
          "\treturn action.Info{",
          "\t\tAnimationLength: delay + skillEndFrames[action.InvalidAction] + skillHitmark,",
          "\t}",
          "}",
        ].join("\n"),
      },
    ];

    expect(readGcsimAnimationFrameNames(sources)).toStrictEqual(
      new Map([
        ["burst.go", "skillEndFrames"],
        ["skill.go", "skillThrustFrames"],
      ]),
    );
  });
});
