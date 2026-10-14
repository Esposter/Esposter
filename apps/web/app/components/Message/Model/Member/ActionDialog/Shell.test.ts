// @vitest-environment happy-dom
import type { useExecuteAdminAction } from "@/composables/message/moderation/useExecuteAdminAction";

import Shell from "@/components/Message/Model/Member/ActionDialog/Shell.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiStyles } from "@/models/ui/UiStyle";
import { AdminActionType } from "@esposter/db-schema";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/composables/message/moderation/useExecuteAdminAction"), () => ({
  useExecuteAdminAction: vi.fn<typeof useExecuteAdminAction>(),
}));

describe("messageModelMemberActionDialogShell", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    beforeEach(() => {
      setActivePinia(createPinia());
    });

    // Happy-dom does not apply autofocus, so the attribute is what holds the focus: Dialog.vue leaves the dialog
    // Unfocused for a control that asks for it, and the browser then focuses Cancel rather than the submit
    test("asks for Cancel's focus, so a keypress right away does not submit", async () => {
      expect.hasAssertions();

      const component = mount(Shell, {
        attachTo: document.body,
        props: {
          getInput: () => ({ roomId: "", targetUserId: "", type: AdminActionType.Warn }),
          modelValue: true,
          submitLabel: "Timeout",
          submitVariant: UiButtonVariant.Danger,
          title: "Timeout user",
        },
      });
      await flushPromises();

      const cancelButton = component.findAll("button").find((button) => button.text() === "Cancel");
      expect(cancelButton?.attributes("autofocus")).toBeDefined();
      expect(document.activeElement).not.toBe(component.get("dialog").element);
    });
  });
});
