export const checkIsCaretAtStart = (target: EventTarget | null) =>
  target instanceof HTMLInputElement && target.selectionStart === 0 && target.selectionEnd === 0;
