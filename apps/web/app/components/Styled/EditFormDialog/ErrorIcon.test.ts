// @vitest-environment happy-dom
import StyledEditFormDialogErrorIcon from "@/components/Styled/EditFormDialog/ErrorIcon.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { DEFAULT_UI_STYLE } from "@@/configuration/UiStyleMap";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("styledEditFormDialogErrorIcon", () => {
  setupUiStyle(DEFAULT_UI_STYLE);

  // Raw, as a prop hands it over: the mount would otherwise proxy it deeply, which a schema does not survive
  const schema = markRaw(z.object({ name: z.string() }));

  // The form counts its fields' rules and the schema says nothing of them, so either alone marks the dialog unsavable
  test.each([
    { editedValue: { name: "" }, isFormValid: true, isValid: true },
    { editedValue: { name: "" }, isFormValid: false, isValid: false },
    { editedValue: {}, isFormValid: true, isValid: false },
  ])("reads $isValid from the form's $isFormValid and the schema", ({ editedValue, isFormValid, isValid }) => {
    expect.hasAssertions();

    const component = mount(StyledEditFormDialogErrorIcon, { props: { editedValue, isFormValid, schema } });

    expect(component.vm.isValid).toBe(isValid);
  });
});
