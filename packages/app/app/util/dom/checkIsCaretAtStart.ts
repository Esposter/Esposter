export const checkIsCaretAtStart = (target: HTMLInputElement): boolean =>
  target.selectionStart === 0 && target.selectionEnd === 0;
