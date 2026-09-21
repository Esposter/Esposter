// What the state files remember of a character: enough for the status line to name and colour them without the
// Game data. The name is the English identity and the display name is what is drawn, so a record written before the
// Display name was kept, or in a language since changed, still resolves to the right character
export interface Nameplate {
  displayName: string;
  element: string;
  name: string;
}
