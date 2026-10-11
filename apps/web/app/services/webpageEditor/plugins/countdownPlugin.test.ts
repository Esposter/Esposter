// @vitest-environment happy-dom
import { countdownPlugin } from "@/services/webpageEditor/plugins/countdownPlugin";
import grapesJS from "grapesjs";
import { afterEach, describe, expect, test, vi } from "vitest";

const createEditor = () => grapesJS.init({ headless: true, plugins: [countdownPlugin], storageManager: false });

// Local midnight a number of days after the epoch, so every test date is computed and never typed
const localDayFromEpoch = (days: number) => {
  const day = new Date(0);
  day.setDate(day.getDate() + days);
  day.setHours(0, 0, 0, 0);
  return day;
};

const toDateInput = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const readElement = (element: HTMLElement, name: string) => element.querySelector<HTMLElement>(`[data-js=${name}]`);

describe(countdownPlugin, () => {
  const COUNTDOWN_ID = "countdown";
  const DIGIT_NAMES = ["day", "hour", "minute", "second"];
  // The hooks the script writes to, as the component renders them. The test DOM drops the attributes grapesjs parses
  // From a component's markup string, so the fixture is written out here and the script is the real one
  const COUNTDOWN_MARKUP = `<span data-js="countdown">${["day", "hour", "minute", "second"]
    .map((name) => `<div><div data-js="countdown-${name}"></div></div>`)
    .join("")}</span><span data-js="countdown-endtext"></span>`;

  // Mounts a countdown the way the canvas does: its markup, then its script bound to the element
  const mountCountdown = (startfrom: string, endText = "EXPIRED") => {
    const editor = createEditor();
    const [component] = editor.addComponents({ endText, startfrom, type: COUNTDOWN_ID });
    const script = component.get("script");
    const element = document.createElement("div");
    element.innerHTML = COUNTDOWN_MARKUP;
    if (typeof script === "function") script.call(element, { endText, startfrom });
    return element;
  };

  const readDigits = (element: HTMLElement) =>
    DIGIT_NAMES.map((name) => readElement(element, `countdown-${name}`)?.textContent);

  afterEach(() => {
    vi.useRealTimers();
  });

  test("registers the countdown block in the Extra category", () => {
    expect.hasAssertions();

    const editor = createEditor();
    const block = editor.Blocks.get(COUNTDOWN_ID);

    expect(block?.getLabel()).toBe("Countdown");
    expect(block?.getCategoryLabel()).toBe("Extra");
  });

  test("registers the countdown component with its start and end-text traits", () => {
    expect.hasAssertions();

    const editor = createEditor();
    const [component] = editor.addComponents({ type: COUNTDOWN_ID });

    expect(component.getTraits().map((trait) => ({ label: trait.getLabel(), name: trait.getName() }))).toStrictEqual([
      { label: "Start", name: "startfrom" },
      { label: "End text", name: "endText" },
    ]);
    expect(component.getTraits().map((trait) => trait.getType())).toStrictEqual(["date", "text"]);
    expect(component.get("script-props")).toStrictEqual(["startfrom", "endText"]);
  });

  test("no upstream issue: a date-only start counts down to local midnight of that day", () => {
    expect.hasAssertions();

    vi.useFakeTimers();
    vi.setSystemTime(localDayFromEpoch(0));
    const element = mountCountdown(toDateInput(localDayFromEpoch(1)));

    expect(readDigits(element)).toStrictEqual(["01", "00", "00", "00"]);
  });

  test("no upstream issue: an end text is written as text, so markup in it is not parsed", () => {
    expect.hasAssertions();

    const endText = "<b>Closed</b>";
    vi.useFakeTimers();
    vi.setSystemTime(localDayFromEpoch(2));
    const element = mountCountdown(toDateInput(localDayFromEpoch(1)), endText);

    expect(readElement(element, "countdown-endtext")?.textContent).toBe(endText);
    expect(element.querySelector("b")).toBeNull();
  });

  test("no upstream issue: a countdown whose element left the canvas stops its own timer", () => {
    expect.hasAssertions();

    vi.useFakeTimers();
    vi.setSystemTime(localDayFromEpoch(0));
    mountCountdown(toDateInput(localDayFromEpoch(1)));
    vi.advanceTimersByTime(1000);

    expect(vi.getTimerCount()).toBe(0);
  });

  test("shows the end text and hides the counter once the start has passed", () => {
    expect.hasAssertions();

    vi.useFakeTimers();
    vi.setSystemTime(localDayFromEpoch(2));
    const element = mountCountdown(toDateInput(localDayFromEpoch(1)));

    expect(readElement(element, "countdown")?.style.display).toBe("none");
    expect(readElement(element, "countdown-endtext")?.style.display).toBe("");
    expect(readElement(element, "countdown-endtext")?.textContent).toBe("EXPIRED");
  });
});
