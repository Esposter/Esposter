export const checkIsCaretAtStart = (target: HTMLInputElement) =>
  target.selectionStart === 0 && target.selectionEnd === 0;
