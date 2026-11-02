import type { GadgetRow } from "#src/models/gadget/GadgetRow";

import { useWorldGadgets } from "#src/composables/useWorldGadgets";
import { GadgetKind } from "#src/models/gadget/GadgetKind";
import { QUICK_SWAP_HOLD_SECONDS } from "#src/services/gadget/constants";
import { readGadgetRows } from "#src/services/gadget/readGadgetRows";
import { EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { flushReads } from "#src/services/shared/flushReads.test";
import { startTestWorldSession } from "#src/store/session.fixture";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/gadget/readGadgetRows"));

describe(useWorldGadgets, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const GADGET: GadgetRow = {
    cooldownGroup: 3,
    cooldownOnFailSeconds: 5,
    cooldownSeconds: 30,
    gatherItemId: 0,
    id: 1001,
    isEquipable: true,
    kind: GadgetKind.Detector,
    maxCountByPlayer: 0,
    maxCountInScene: 0,
    maxPoints: 0,
    region: "",
  };
  // A press shorter than the quick swap's hold, held for one frame and released on the next
  const tap = (stepQuickUse: ReturnType<typeof useWorldGadgets>["stepQuickUse"]) => {
    const seconds = QUICK_SWAP_HOLD_SECONDS / 2;
    stepQuickUse({ isActive: true, isHeld: true, now: epoch, seconds });
    return stepQuickUse({ isActive: true, isHeld: false, now: epoch, seconds });
  };

  test("z reports the equipped gadget as used once, and nothing while its cooldown runs", async () => {
    expect.hasAssertions();

    vi.mocked(readGadgetRows).mockResolvedValue([GADGET]);
    startTestWorldSession(
      {},
      { inventory: { ...EMPTY_INVENTORY, equippedGadgetItemId: GADGET.id }, wallet: { ...EMPTY_WALLET } },
    );
    const { stepQuickUse } = useWorldGadgets();
    await flushReads();

    expect(tap(stepQuickUse)).toStrictEqual(GADGET);
    expect(tap(stepQuickUse)).toBeUndefined();
  });
});
