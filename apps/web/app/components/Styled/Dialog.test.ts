// @vitest-environment nuxt
import StyledDialog from "@/components/Styled/Dialog.vue";
import { sleep } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, test } from "vitest";

describe("styledDialog", () => {
  const text = "text";
  const body = "<p>a</p>";
  const prependConfirm = '<button class="v-btn">a</button>';
  const pendingMs = 20;
  // The dialog teleports to the overlay container, so assertions read the document rather than the wrapper —
  // Which makes the teardown load-bearing: every mount appends its own overlay, so without it the second test
  // In the file counts the first test's buttons too. The helper mutates this, so the two live together
  let wrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined;
  const mountOpenDialog = async (
    props: InstanceType<typeof StyledDialog>["$props"],
    slots?: Record<string, string>,
  ) => {
    wrapper = await mountSuspended(StyledDialog, {
      attachTo: document.body,
      props: { ...props, modelValue: true },
      slots,
    });
    return document.body;
  };

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    document.body.innerHTML = "";
    document.documentElement.style.overflowY = "";
  });

  // A dialog that is already open when it is created — one whose model is set by the page's own async setup —
  // Has no overlay root until it mounts, and a navigation defers that mount by rendering the incoming page into
  // A suspense that is still pending. Vuetify's block scroll strategy reads the root a tick later either way, so
  // Without the mount gate it throws on `undefined.classList` and takes the page render down with it. The
  // Strategy only reaches the root when the document scrolls, which is why the test gives it a scrollbar
  test("opens a dialog created open while its mount waits on a pending sibling", async () => {
    expect.hasAssertions();
    document.documentElement.style.overflowY = "scroll";
    const PendingSibling = defineComponent({
      async setup() {
        await sleep(pendingMs);
        return () => h("div");
      },
    });

    wrapper = await mountSuspended(
      defineComponent({
        setup: () => () => [h(PendingSibling), h(StyledDialog, { modelValue: true }, { default: () => h("p", "a") })],
      }),
      { attachTo: document.body },
    );
    // The strategy runs on its own timeout once the overlay activates, so the throw lands after the mount
    await sleep(pendingMs);

    expect(document.body.querySelector(".v-overlay__content p")?.textContent).toBe("a");
  });

  // Every dialog is meant to reach for this shell, so what these pin are the two shapes whose absence forces a
  // Consumer to re-roll it: a dialog with nothing to confirm, and a confirm button spelling out the default colour
  test("renders no actions row when there is nothing to confirm", async () => {
    expect.hasAssertions();

    const overlay = await mountOpenDialog({}, { default: body });

    expect(overlay.querySelector(".v-overlay__content footer")).toBeNull();
    // The row it replaces carried the only explicit dismissal, so the shell owes one back
    expect(overlay.querySelector('[aria-label="Close"], button [class~="i-mdi:close"]')).not.toBeNull();
  });

  test("renders the actions row when there is something to confirm", async () => {
    expect.hasAssertions();

    const overlay = await mountOpenDialog({ confirmButtonProps: { text } }, { default: body });

    expect(overlay.querySelector(".v-overlay__content footer")).not.toBeNull();
    expect(overlay.textContent).toContain("Cancel");
  });

  test("draws a warning or error confirmation as the danger button", async () => {
    expect.hasAssertions();

    const overlay = await mountOpenDialog({ confirmButtonProps: { color: "warning", text } });

    expect(
      Array.from(
        overlay.querySelectorAll<HTMLElement>(".v-overlay__content footer button"),
        (button) => button.dataset.variant,
      ),
    ).toStrictEqual(["Quiet", "Danger"]);
  });

  // A third decision is a button among the other two, so it belongs in the trailing group rather than pushed to
  // The opposite edge with the annotations — which is where it lands if it is passed as `prepend-actions`
  test("renders a third decision between cancel and confirm", async () => {
    expect.hasAssertions();

    const overlay = await mountOpenDialog({ confirmButtonProps: { text } }, { "prepend-confirm": prependConfirm });

    expect(
      Array.from(overlay.querySelectorAll(".v-overlay__content footer button"), ({ textContent }) =>
        textContent?.trim(),
      ),
    ).toStrictEqual(["Cancel", "a", text]);
  });

  // The row exists when the row has content, not only when there is a confirm button: a dialog whose only answers
  // Are cancel and an alternative still needs somewhere to put them
  test("renders the actions row for an action slot with nothing to confirm", async () => {
    expect.hasAssertions();

    const overlay = await mountOpenDialog({}, { "prepend-confirm": prependConfirm });

    expect(
      Array.from(overlay.querySelectorAll(".v-overlay__content footer button"), ({ textContent }) =>
        textContent?.trim(),
      ),
    ).toStrictEqual(["Cancel", "a"]);
    // The row carries the dismissal, so the append close button would be a second one
    expect(overlay.querySelector('[aria-label="Close"], button [class~="i-mdi:close"]')).toBeNull();
  });

  // The header is the reason a search field can sit above a scrolling list without the consumer rebuilding the
  // Card: it renders outside the scroll container rather than as the first body child
  test("renders the header slot outside the scrollable body", async () => {
    expect.hasAssertions();

    const overlay = await mountOpenDialog({}, { default: body, header: "<input data-header>" });

    expect(overlay.querySelector("[data-header]")).not.toBeNull();
    expect(overlay.querySelector(".v-overlay__content section > div [data-header]")).toBeNull();
  });
});
