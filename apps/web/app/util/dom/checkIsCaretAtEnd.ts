export const checkIsCaretAtEnd = (target: HTMLInputElement) =>
  target.selectionStart === target.value.length && target.selectionEnd === target.value.length;
