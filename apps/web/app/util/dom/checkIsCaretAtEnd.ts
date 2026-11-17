export const checkIsCaretAtEnd = (target: EventTarget | null) =>
  target instanceof HTMLInputElement &&
  target.selectionStart === target.value.length &&
  target.selectionEnd === target.value.length;
