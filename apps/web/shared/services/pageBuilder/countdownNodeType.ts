import type { HtmlElement } from "#shared/models/pageBuilder/HtmlElement";
import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { getResult } from "@esposter/shared";
import { z } from "zod";

// A date, or a date and a time, in the form the editor's inputs write
const ENDS_AT_REGEX = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})(?:T(?<hour>\d{2}):(?<minute>\d{2}))?$/u;

// Whether the value names a real calendar date and time: Temporal refuses an impossible one, where Date rolls it over
// Into a later one, and a date-only value is midnight
const checkIsRealEndsAt = (endsAt: string): boolean =>
  getResult(() => Temporal.PlainDateTime.from(endsAt)).match(
    () => true,
    () => false,
  );

const countdownFormSchema = z.strictObject({
  endsAt: z.string().regex(ENDS_AT_REGEX).refine(checkIsRealEndsAt, { error: "is not a real date and time" }),
  endText: z.string(),
});
const countdownPropsSchema = z.strictObject({ ...countdownFormSchema.shape, id: z.string() });

// Serialised with toString() and run in the page, so it names nothing outside its own body. A date-only value is local
// Midnight, as the input means it, and the date and time forms are read field by field, since Safari rejects the space form
const countdownScript = () => {
  const SECOND = 1000;
  const MINUTE = 60 * SECOND;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const ENDS_AT = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})(?:T(?<hour>\d{2}):(?<minute>\d{2}))?$/u;

  const startCountdown = (element: HTMLElement) => {
    const groups = ENDS_AT.exec(element.dataset.endsAt ?? "")?.groups;
    if (!groups) return;

    const endAt = new Date(
      Number(groups.year),
      Number(groups.month) - 1,
      Number(groups.day),
      Number(groups.hour ?? 0),
      Number(groups.minute ?? 0),
    ).getTime();
    const units = element.querySelectorAll<HTMLElement>(".countdown-unit");
    const endElement = element.querySelector<HTMLElement>(".countdown-end");
    // Returns whether the countdown is still running, and shows the end text once it has passed
    const renderTime = () => {
      const distance = endAt - Date.now();
      if (distance < 0) {
        for (const unit of units) unit.hidden = true;
        if (endElement) {
          endElement.textContent = element.dataset.endText ?? "";
          endElement.hidden = false;
        }
        return false;
      }

      const amounts: Record<string, number> = {
        day: Math.floor(distance / DAY),
        hour: Math.floor((distance % DAY) / HOUR),
        minute: Math.floor((distance % HOUR) / MINUTE),
        second: Math.floor((distance % MINUTE) / SECOND),
      };
      for (const unit of units) {
        const value = unit.querySelector<HTMLElement>(".countdown-value");
        if (value) value.textContent = String(amounts[unit.dataset.unit ?? ""] ?? 0).padStart(2, "0");
      }
      return true;
    };

    if (!renderTime()) return;

    // A re-rendered page detaches its old element, and nothing else would stop that element's timer
    const timer = window.setInterval(() => {
      if (!element.isConnected) {
        window.clearInterval(timer);
        return;
      }

      if (!renderTime()) window.clearInterval(timer);
    }, SECOND);
  };

  for (const element of document.querySelectorAll<HTMLElement>(".countdown")) startCountdown(element);
};

const createCountdownUnit = (name: string): HtmlElement => ({
  attributes: { class: "countdown-unit", "data-unit": name },
  children: [{ attributes: { class: "countdown-value" }, children: [], tag: "span" }, ` ${name}s`],
  tag: "span",
});

export const countdownNodeType = {
  css: `.countdown { display: flex; justify-content: center; gap: 1rem; text-align: center; }
.countdown-unit { display: inline-flex; flex-direction: column; }
.countdown-value { font-size: 2rem; font-variant-numeric: tabular-nums; }
.countdown-end { font-size: 2rem; }`,
  formSchema: countdownFormSchema,
  propsSchema: countdownPropsSchema,
  // The timer's live region stays off, so a screen reader is not told each tick; the script fills in the values
  render: (node) => {
    const { endsAt, endText } = countdownPropsSchema.parse(node.props);
    return {
      attributes: {
        "aria-atomic": "false",
        "aria-live": "off",
        class: "countdown",
        "data-end-text": endText,
        "data-ends-at": endsAt,
        role: "timer",
      },
      children: [
        ...["day", "hour", "minute", "second"].map((unit) => createCountdownUnit(unit)),
        { attributes: { class: "countdown-end", hidden: "" }, children: [], tag: "span" },
      ],
      tag: "div",
    };
  },
  script: countdownScript,
  slots: {},
  type: WebpageNodeType.Countdown,
} satisfies NodeTypeDefinition;
