export const MAX_TYPED_TEXT_STRING_COUNT = 10;
export const TYPED_TEXT_CLASS = "page-typed-text";
export const VISUALLY_HIDDEN_CLASS = "page-visually-hidden";
export const TYPED_TEXT_CSS = `.${VISUALLY_HIDDEN_CLASS}{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`;
// Types and erases each string in turn, after the first has been read. Under reduced motion it never starts, so the
// First string stands still, and a typed text whose element has left the page stops
export const TYPED_TEXT_SCRIPT = `if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
  for (const element of document.querySelectorAll(".${TYPED_TEXT_CLASS}")) {
    const output = element.querySelector("[aria-hidden]");
    const strings = JSON.parse(element.dataset.strings ?? "[]");
    const isLoop = element.hasAttribute("data-loop");
    let stringIndex = 0;
    let length = strings[0]?.length ?? 0;
    let isErasing = true;
    const step = () => {
      if (!element.isConnected || !output) return;
      const string = strings[stringIndex] ?? "";
      if (isErasing) length--;
      else length++;
      output.textContent = string.slice(0, length);
      if (isErasing && length === 0) {
        if (stringIndex === strings.length - 1 && !isLoop) return;
        stringIndex = (stringIndex + 1) % strings.length;
        isErasing = false;
      } else if (!isErasing && length === string.length) {
        if (stringIndex === strings.length - 1 && !isLoop) return;
        isErasing = true;
        setTimeout(step, 1500);
        return;
      }
      setTimeout(step, isErasing ? 40 : 80);
    };
    if (strings.length > 1) setTimeout(step, 1500);
  }`;
