import GcgScreenCharacter from "#src/components/Gcg/Screen/Character/Index.vue";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("gcgScreenCharacter", () => {
  const NAME = "Keqing";
  const HP = 10;
  const ENERGY = 2;
  const MAX_ENERGY = 3;
  const SHIELD = 1;

  // The character's name, then each of its numbers worded by the game's label for it, its shield too
  test("a character's name is read with its HP, energy and shield", async () => {
    expect.hasAssertions();

    await render(GcgScreenCharacter, {
      props: {
        aura: GcgAura.None,
        energy: ENERGY,
        energyLabel: "Energy",
        hp: HP,
        hpLabel: "HP",
        isChoosable: false,
        maxEnergy: MAX_ENERGY,
        name: NAME,
        shield: SHIELD,
        shieldLabel: "Shield",
      },
    });

    await expect
      .element(page.getByRole("button", { exact: true, name: `${NAME}, HP ${HP}, Energy ${ENERGY}, Shield ${SHIELD}` }))
      .toBeInTheDocument();
  });

  // A label with no text id yet is left out, so its number is read alone after the one before it
  test("a number whose label has no text id is read alone", async () => {
    expect.hasAssertions();

    await render(GcgScreenCharacter, {
      props: {
        aura: GcgAura.None,
        energy: ENERGY,
        energyLabel: "",
        hp: HP,
        hpLabel: "HP",
        isChoosable: false,
        maxEnergy: MAX_ENERGY,
        name: NAME,
        shield: SHIELD,
        shieldLabel: "",
      },
    });

    await expect
      .element(page.getByRole("button", { exact: true, name: `${NAME}, HP ${HP}, ${ENERGY}, ${SHIELD}` }))
      .toBeInTheDocument();
  });
});
