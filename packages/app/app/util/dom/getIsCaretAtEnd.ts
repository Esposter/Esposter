export const getIsCaretAtEnd = (target: HTMLInputElement): boolean =>
  target.selectionStart === target.value.length && target.selectionEnd === target.value.length;
