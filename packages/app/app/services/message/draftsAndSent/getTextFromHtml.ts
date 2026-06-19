import { getIsServer } from "@esposter/shared";

export const getTextFromHtml = (html: string) => {
  if (getIsServer()) return html;
  const element = window.document.createElement("div");
  element.innerHTML = html;
  return element.textContent ?? "";
};
