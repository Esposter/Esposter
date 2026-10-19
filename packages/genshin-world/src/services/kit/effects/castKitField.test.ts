import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";

import { castKitField } from "#src/services/kit/effects/castKitField";
import { describe, expect, test, vi } from "vitest";

const checkIsField = (effect: KitEffect): effect is KitField => effect.kind === "field";
const readField = ({ centre, id, secondsRemaining }: KitField) => ({ centre, id, secondsRemaining });
// The fields a kit effect state holds, each read as its centre, id and seconds remaining
const readFields = (kitEffectState: KitEffectState) =>
  kitEffectState.effects.filter((effect) => checkIsField(effect)).map((field) => readField(field));

// A field the character casts at the point on the x axis under the name given, for the seconds left of it
const castNamedField = (
  kitEffectState: KitEffectState,
  characterId: number,
  x: number,
  id: string,
  secondsRemaining: number,
): KitField =>
  castKitField(
    kitEffectState,
    characterId,
    { x, z: 0 },
    { id, nextTickSeconds: 1, onTick: vi.fn<KitField["onTick"]>(), secondsRemaining, tickIntervalSeconds: 1 },
  );

describe(castKitField, () => {
  test("a field its caster casts again under its name replaces the one standing, as the game restarts it", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    castNamedField(kitEffectState, 1, 0, "field", 5);
    castNamedField(kitEffectState, 1, 3, "field", 9);

    expect(readFields(kitEffectState)).toStrictEqual([{ centre: { x: 3, z: 0 }, id: "field", secondsRemaining: 9 }]);
  });

  test("a field under another name, or cast by another character, stands beside the one already standing", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    castNamedField(kitEffectState, 1, 0, "field", 5);
    castNamedField(kitEffectState, 1, 3, "other", 5);
    castNamedField(kitEffectState, 2, 6, "field", 5);

    expect(readFields(kitEffectState)).toStrictEqual([
      { centre: { x: 0, z: 0 }, id: "field", secondsRemaining: 5 },
      { centre: { x: 3, z: 0 }, id: "other", secondsRemaining: 5 },
      { centre: { x: 6, z: 0 }, id: "field", secondsRemaining: 5 },
    ]);
  });

  test("a field with no name stands beside the one it is cast beside", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    const unnamed = (x: number): KitField =>
      castKitField(
        kitEffectState,
        1,
        { x, z: 0 },
        { nextTickSeconds: 1, onTick: vi.fn<KitField["onTick"]>(), secondsRemaining: 5, tickIntervalSeconds: 1 },
      );
    unnamed(0);
    unnamed(3);

    expect(readFields(kitEffectState)).toStrictEqual([
      { centre: { x: 0, z: 0 }, id: undefined, secondsRemaining: 5 },
      { centre: { x: 3, z: 0 }, id: undefined, secondsRemaining: 5 },
    ]);
  });

  test("a stacked field stands beside the others under its name, as gcsim keeps each one a character leaves", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    for (const x of [0, 3])
      castKitField(
        kitEffectState,
        1,
        { x, z: 0 },
        {
          id: "droplet",
          isStacked: true,
          nextTickSeconds: 1,
          onTick: vi.fn<KitField["onTick"]>(),
          secondsRemaining: 5,
          tickIntervalSeconds: 1,
        },
      );

    expect(readFields(kitEffectState)).toStrictEqual([
      { centre: { x: 0, z: 0 }, id: "droplet", secondsRemaining: 5 },
      { centre: { x: 3, z: 0 }, id: "droplet", secondsRemaining: 5 },
    ]);
  });
});
