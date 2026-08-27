import { checkIsServer } from "@esposter/shared";

export const getTextFromHtml = (html: string) => {
  if (checkIsServer()) return html;
  const element = window.document.createElement("div");
  element.innerHTML = html;
  return element.textContent ?? "";
};
