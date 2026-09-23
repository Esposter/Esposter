import type { VBtn } from "vuetify/components";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { getUiButtonProps } from "@/services/styled/getUiButtonProps";
import { describe, expect, test } from "vitest";

describe(getUiButtonProps, () => {
  test.each<[VBtn["$props"], UiButtonVariant | undefined]>([
    [{}, UiButtonVariant.Accent],
    [{ color: "error", variant: "text" }, UiButtonVariant.Quiet],
    [{ color: "error" }, UiButtonVariant.Danger],
    [{ color: "primary" }, UiButtonVariant.Accent],
    [{ variant: "tonal" }, undefined],
  ])("reads %o as the %s variant", (buttonProps, variant) => {
    expect.hasAssertions();

    expect(getUiButtonProps(buttonProps, UiButtonVariant.Accent).variant).toBe(variant);
  });

  test("disables a pending button and keeps what Vuetify alone reads off the element", () => {
    expect.hasAssertions();

    const { attributes, isDisabled } = getUiButtonProps({ loading: true, size: "small", value: "value" });

    expect(isDisabled).toBe(true);
    expect(attributes).toStrictEqual({ value: "value" });
  });
});
