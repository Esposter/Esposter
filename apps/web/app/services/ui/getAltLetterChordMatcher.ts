// Matches a shortcut holding Alt with a letter by the letter's key rather than the character it types. Alt changes the
// Character: Option with C types ç on a Mac, and Ctrl with Alt is AltGr on some layouts, so the hotkey composable, which
// Compares characters, never sees the chord. Ctrl and Cmd are one modifier here, as the shortcut labels show them.
// Undefined for any other shortcut, which the hotkey composable matches as it is
export const getAltLetterChordMatcher = (shortcut: string): ((event: KeyboardEvent) => boolean) | undefined => {
  const keys = shortcut.toLowerCase().split("+");
  const letter = keys.at(-1);
  if (!keys.includes("alt") || letter === undefined || !/^[a-z]$/u.test(letter)) return undefined;

  const code = `Key${letter.toUpperCase()}`;
  const isCommand = keys.some((key) => key === "cmd" || key === "ctrl" || key === "meta");
  const isShift = keys.includes("shift");
  return (event) =>
    event.altKey && event.code === code && (event.ctrlKey || event.metaKey) === isCommand && event.shiftKey === isShift;
};
