import { useDisplayWidths } from "@/composables/dungeons/UI/healthBar/useDisplayWidths";
import { describe, expect, test } from "vitest";

describe(useDisplayWidths, () => {
  // The middle takes what the two caps leave of the total, and the right cap takes the rest of the display width
  test("sets the middle once both caps have measured", async () => {
    expect.hasAssertions();

    const displayWidth = ref(10);
    const { leftCapDisplayWidth, middleDisplayWidth, rightCapDisplayWidth } = useDisplayWidths(10, displayWidth);
    leftCapDisplayWidth.value = 1;
    rightCapDisplayWidth.value = 2;
    await nextTick();

    expect(middleDisplayWidth.value).toBe(7);
    expect(rightCapDisplayWidth.value).toBe(2);
  });
});
