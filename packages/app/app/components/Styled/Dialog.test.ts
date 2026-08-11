// @vitest-environment nuxt
import StyledDialog from "@/components/Styled/Dialog.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, test } from "vitest";

// The dialog teleports to the overlay container, so assertions read the document rather than the wrapper — which
// Makes the teardown load-bearing: every mount appends its own overlay, so without it the second test in the file
// Counts the first test's buttons too
let wrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined;
const mountOpenDialog = async (props: InstanceType<typeof StyledDialog>["$props"], slots?: Record<string, string>) => {
  wrapper = await mountSuspended(StyledDialog, {
    attachTo: document.body,
    props: { ...props, modelValue: true },
    slots,
  });
  return document.body;
};

// `primary` is StyledButton's own colour, so naming it explicitly must not opt out of the gradient — the
// Previous gate read any colour at all as "the caller wants a plain button"
// StyledButton is a v-btn carrying the gradient as an inline background-image, so that style is what
// Distinguishes it from the plain button in the rendered output
const getGradientButtons = (body: HTMLElement) =>
  [...body.querySelectorAll<HTMLElement>(".v-card-actions .v-btn")].filter(({ style }) =>
    style.backgroundImage.includes("--midnight-bloom"),
  );

describe("styledDialog", () => {
  const text = "Confirm";

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    document.body.innerHTML = "";
  });

  // Every dialog is meant to reach for this shell, so the two things that used to force a consumer to re-roll it
  // Are what these pin: a dialog with nothing to confirm, and a confirm button that spells out the default colour
  test("renders no actions row when there is nothing to confirm", async () => {
    expect.hasAssertions();

    const body = await mountOpenDialog({}, { default: "<p>body</p>" });

    expect(body.querySelector(".v-card-actions")).toBeNull();
    // The row it replaces carried the only explicit dismissal, so the shell owes one back
    expect(body.querySelector('[aria-label="Close"], button .mdi-close')).not.toBeNull();
  });

  test("renders the actions row when there is something to confirm", async () => {
    expect.hasAssertions();

    const body = await mountOpenDialog({ confirmButtonProps: { text } }, { default: "<p>body</p>" });

    expect(body.querySelector(".v-card-actions")).not.toBeNull();
    expect(body.textContent).toContain("Cancel");
  });

  test("keeps the styled confirm button when the caller spells out the primary colour", async () => {
    expect.hasAssertions();

    const body = await mountOpenDialog({ confirmButtonProps: { color: "primary", text } });

    expect(getGradientButtons(body)).toHaveLength(1);
  });

  test("drops to a plain button for a colour that is not the default", async () => {
    expect.hasAssertions();

    const body = await mountOpenDialog({ confirmButtonProps: { color: "warning", text } });

    expect(getGradientButtons(body)).toHaveLength(0);
    expect(body.querySelector(".v-card-actions .text-warning")).not.toBeNull();
  });

  // The header is the reason a search field can sit above a scrolling list without the consumer rebuilding the
  // Card: it renders outside the scroll container rather than as the first body child
  test("renders the header slot outside the scrollable body", async () => {
    expect.hasAssertions();

    const body = await mountOpenDialog({}, { default: "<p>body</p>", header: "<input data-header>" });

    expect(body.querySelector("[data-header]")).not.toBeNull();
    expect(body.querySelector(".v-card-text [data-header]")).toBeNull();
  });
});
