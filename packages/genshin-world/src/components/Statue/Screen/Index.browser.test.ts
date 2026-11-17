import { props } from "#src/components/Statue/Screen/Index.fixture";
import StatueScreen from "#src/components/Statue/Screen/Index.vue";
import { RESTORATIVE_POWER_REFILL_SECONDS } from "#src/services/statue/constants";
import { regenerateRestorativePower } from "#src/services/statue/regenerateRestorativePower";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";

describe("statueScreen", () => {
  test("the pool shows the refill the world's clock has reached as it moves on", async () => {
    expect.hasAssertions();

    const { now } = props;
    const power = { amount: 0, changedAt: now };
    const { rerender } = await render(StatueScreen, { props: { ...props, now, power } });
    const later = now.add({ seconds: RESTORATIVE_POWER_REFILL_SECONDS });
    await rerender({ ...props, now: later, power });

    expect(document.querySelector(".amount")?.textContent).toBe(
      String(Math.floor(regenerateRestorativePower(power, props.statueCount, later).amount)),
    );
  });
});
