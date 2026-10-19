import type { HtmlElement } from "#shared/models/pageBuilder/HtmlElement";

export const createCountdownUnit = (name: string): HtmlElement => ({
  attributes: { class: "countdown-unit", "data-unit": name },
  children: [{ attributes: { class: "countdown-value" }, children: [], tag: "span" }, ` ${name}s`],
  tag: "span",
});
