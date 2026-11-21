import type { VueWrapper } from "@vue/test-utils";

// The button a test presses, found by its label. A label no button carries fails naming that label
export const findButton = (component: VueWrapper, text: string) => {
  const button = component.findAll("button").find((candidate) => candidate.text() === text);
  if (!button) throw new Error(`no ${text} button`);

  return button.element as HTMLButtonElement;
};
