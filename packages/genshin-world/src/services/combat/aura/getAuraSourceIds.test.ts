import { AuraType } from "#src/models/combat/AuraType";
import { Element } from "#src/models/Element";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { consumeAuras } from "#src/services/combat/aura/consumeAuras";
import { createElementalState } from "#src/services/combat/aura/createElementalState";
import { getAuraSourceIds } from "#src/services/combat/aura/getAuraSourceIds";
import { describe, expect, test } from "vitest";

describe(getAuraSourceIds, () => {
  test("keeps each source's share of an aura, a share a reduction spends no longer standing in it until reapplied", () => {
    expect.hasAssertions();

    const state = createElementalState();
    applyElement(state, Element.Hydro, 1, { auraDecayRateScale: 1, sourceId: 1 });
    applyElement(state, Element.Hydro, 2, { auraDecayRateScale: 1, sourceId: 2 });
    const appliedSourceIds = getAuraSourceIds(state, AuraType.Hydro);
    consumeAuras(state.auras, [AuraType.Hydro], 1);
    const reducedSourceIds = getAuraSourceIds(state, AuraType.Hydro);
    applyElement(state, Element.Hydro, 1, { auraDecayRateScale: 1, sourceId: 1 });
    const reappliedSourceIds = getAuraSourceIds(state, AuraType.Hydro);

    expect([appliedSourceIds, reducedSourceIds, reappliedSourceIds]).toStrictEqual([[1, 2], [2], [1, 2]]);
  });

  test("holds no source of an aura that is gone", () => {
    expect.hasAssertions();

    const state = createElementalState();
    applyElement(state, Element.Hydro, 1, { auraDecayRateScale: 1, sourceId: 1 });
    consumeAuras(state.auras, [AuraType.Hydro], 1);

    expect(getAuraSourceIds(state, AuraType.Hydro)).toStrictEqual([]);
  });
});
