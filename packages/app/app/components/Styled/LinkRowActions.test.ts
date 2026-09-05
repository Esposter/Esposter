// @vitest-environment nuxt
import StyledLinkRowActions from "@/components/Styled/LinkRowActions.vue";
import { RoutePath } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test, vi } from "vitest";

describe("styledLinkRowActions", () => {
  // The DOM fixes an anchor's activation target while building the event path, before any listener runs, so a
  // Nested control that only stops propagation suppresses the router handler that would have called
  // `preventDefault` and leaves the browser hard-loading the row's href on top of the control's own action
  test("cancels the row's activation while still running the control's action", async () => {
    expect.hasAssertions();

    const onActionClick = vi.fn<() => void>();
    const onRowClick = vi.fn<() => void>();
    const component = await mountSuspended(StyledLinkRowActions, {
      slots: { default: () => h("button", { onClick: onActionClick, type: "button" }) },
    });
    const row = document.createElement("a");
    row.href = RoutePath.ResourceExplorerAll;
    row.addEventListener("click", onRowClick);
    row.append(component.element);
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    component.get("button").element.dispatchEvent(event);

    expect(onActionClick).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
