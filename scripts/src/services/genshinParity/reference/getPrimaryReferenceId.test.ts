import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { getPrimaryReferenceId } from "#src/services/genshinParity/reference/getPrimaryReferenceId";
import { describe, expect, test } from "vitest";

describe(getPrimaryReferenceId, () => {
  const SCREEN_NAME = "FooScreen";
  const SOURCE = " ";
  const PENDING_REASON = " ";
  const REGION = { height: 0, width: 0, x: 0, y: 0 };
  // An entry overrides the fixture's props by naming any, so the presence of `props` alone is what the pick reads
  const PROPS = {};
  const WHOLE_REFERENCE = { screen: SCREEN_NAME, source: SOURCE } satisfies ParityReference;
  const REGION_REFERENCE = { ...WHOLE_REFERENCE, region: REGION } satisfies ParityReference;
  const PROPS_WHOLE_REFERENCE = { ...WHOLE_REFERENCE, props: PROPS } satisfies ParityReference;
  const PROPS_REGION_REFERENCE = { ...REGION_REFERENCE, props: PROPS } satisfies ParityReference;
  const PENDING_REFERENCE = { pending: PENDING_REASON, screen: SCREEN_NAME } satisfies ParityReference;
  const cases: [string, [string, ParityReference][], string][] = [
    [
      "a whole-screen entry with no props override, over a props override listed before it",
      [
        ["props-whole", PROPS_WHOLE_REFERENCE],
        ["plain-whole", WHOLE_REFERENCE],
      ],
      "plain-whole",
    ],
    [
      "the first entry with no props override, where none of them is whole-screen",
      [
        ["props-whole", PROPS_WHOLE_REFERENCE],
        ["plain-region", REGION_REFERENCE],
        ["props-region", PROPS_REGION_REFERENCE],
      ],
      "plain-region",
    ],
    [
      "the first whole-screen entry, where every entry overrides props",
      [
        ["props-region", PROPS_REGION_REFERENCE],
        ["props-whole", PROPS_WHOLE_REFERENCE],
        ["other-props-whole", PROPS_WHOLE_REFERENCE],
      ],
      "props-whole",
    ],
    [
      "the first entry, where every entry overrides props and none is whole-screen",
      [
        ["props-region", PROPS_REGION_REFERENCE],
        ["other-props-region", PROPS_REGION_REFERENCE],
      ],
      "props-region",
    ],
    [
      "a plain whole-screen entry, where a plain region entry is listed before it",
      [
        ["plain-region", REGION_REFERENCE],
        ["plain-whole", WHOLE_REFERENCE],
      ],
      "plain-whole",
    ],
    [
      "a live entry over a pending one listed before it",
      [
        ["pending", PENDING_REFERENCE],
        ["plain-region", REGION_REFERENCE],
      ],
      "plain-region",
    ],
    [
      "the first pending entry, where the variant holds no live one",
      [
        ["pending-first", PENDING_REFERENCE],
        ["pending-second", PENDING_REFERENCE],
      ],
      "pending-first",
    ],
  ];

  test.each(cases)("should pick %s", (_title, entries, expected) => {
    expect.hasAssertions();

    expect(getPrimaryReferenceId(entries)).toBe(expected);
  });
});
