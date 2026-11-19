// A key held with Alt, Ctrl or Meta is a chord, which a grid leaves to whatever binds it: Alt+Left is the browser's Back
export const checkHasChordModifier = (event: KeyboardEvent) => event.altKey || event.ctrlKey || event.metaKey;
