import type { KitOverlayEntry } from "#src/models/genshinAssets/kits/KitOverlayEntry";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { keepCommittedKitCause } from "#src/services/genshinAssets/kits/record/keepCommittedKitCause";
import { describe, expect, test } from "vitest";

describe(keepCommittedKitCause, () => {
  test.each<[string, KitOverlayEntry | undefined, KitOverlayEntry | undefined, unknown, KitOverlayEntry | undefined]>([
    [
      "no source gives it and nothing is committed",
      { cause: KitProvisionalCause.Unclassified, value: 1 },
      undefined,
      1,
      { cause: KitProvisionalCause.Unclassified, value: 1 },
    ],
    [
      "a committed cause stands while its value does",
      { cause: KitProvisionalCause.Unclassified, value: 1 },
      { cause: KitProvisionalCause.TargetCentred, value: 1 },
      1,
      { cause: KitProvisionalCause.TargetCentred, value: 1 },
    ],
    [
      "a committed cause without a value stands for a removed value",
      { cause: KitProvisionalCause.Unclassified },
      { cause: KitProvisionalCause.BoxAsCircle },
      undefined,
      { cause: KitProvisionalCause.BoxAsCircle },
    ],
    [
      "a committed value that no longer stands is not kept",
      { cause: KitProvisionalCause.Unclassified, value: 2 },
      { cause: KitProvisionalCause.TargetCentred, value: 1 },
      2,
      { cause: KitProvisionalCause.Unclassified, value: 2 },
    ],
    [
      "a committed Unclassified is not a cause",
      { cause: KitProvisionalCause.Unclassified, value: 1 },
      { cause: KitProvisionalCause.Unclassified, value: 1 },
      1,
      { cause: KitProvisionalCause.Unclassified, value: 1 },
    ],
    [
      "a source disagreeing with the value gives its own cause over a committed one",
      { cause: KitProvisionalCause.DiffersFromSource, value: 1 },
      { cause: KitProvisionalCause.TargetCentred, value: 1 },
      1,
      { cause: KitProvisionalCause.DiffersFromSource, value: 1 },
    ],
    [
      "a source choice is kept over a committed cause",
      { source: KitSource.Gcsim },
      { cause: KitProvisionalCause.TargetCentred, value: 1 },
      1,
      { source: KitSource.Gcsim },
    ],
    ["the default already is it", undefined, { cause: KitProvisionalCause.TargetCentred, value: 1 }, 1, undefined],
  ])("keeps the committed cause when %s", (_case, entry, committedEntry, value, expected) => {
    expect.hasAssertions();

    expect(keepCommittedKitCause(entry, committedEntry, value, {})).toStrictEqual(expected);
  });
});
