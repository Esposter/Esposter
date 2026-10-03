// The plugin's state contract, the one self-contained file the engine validates the hooks module's `$.state` keys
// Against; the plugin's own scripts print these shapes and import them from here, so each is written once
// What the hooks module reads of the session's character: the status line it pins, and the colour the mods draw their
// Accent in, already readable on a dark terminal. The English name is the identity a switch compares
export interface PersonaCharacter {
  // A colour readable on a dark terminal, "" for a character with neither a colour nor an element of their own
  color: string;
  displayName: string;
  line: string;
  name: string;
}

// Everything the spinner and the prompt hint show for one character. The verbs carry both layers, the base Teyvat
// Content with the character's own behind it; the tips are the character's lines, shown under their name
export interface PersonaSpinner {
  // The character's name as the interface language spells it, in front of every tip
  label: string;
  tips: string[];
  verbs: string[];
}

declare module "claude-code" {
  interface PluginState {
    "genshin-persona": { character: PersonaCharacter; spinner: PersonaSpinner; tipIndex: number };
  }
}
