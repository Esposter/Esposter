// The action a key takes in a field: the browser's default for the key is held back and the action runs, except during
// An IME composition, where the key belongs to the composition and is left to it
export const handleKeyAction = (event: KeyboardEvent, action: () => void) => {
  if (event.isComposing) return;
  event.preventDefault();
  action();
};
