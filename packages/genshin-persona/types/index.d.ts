// The plugin's state contract, the one self-contained file the engine validates the hooks module's `$.state` keys
// Against; the plugin's own scripts print these shapes and import them from here, so each is written once
// What the hooks module reads of the session's character: the colour the mods draw their accent in, already readable
// On a dark terminal, and the names a switch compares — the English one the identity, the display one the language's
export interface PersonaCharacter {
  // A colour readable on a dark terminal, "" for a character with neither a colour nor an element of their own
  color: string;
  displayName: string;
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

// What the status script prints: the character, and whether it is this session's own record rather than the pin or
// The birthday pick standing in while the start hook is still recording
export interface PersonaStatus {
  character: PersonaCharacter;
  isRecorded: boolean;
}

declare module "claude-code" {
  interface PluginState {
    "genshin-persona": {
      character: PersonaCharacter;
      isCharacterRecorded: boolean;
      spinner: PersonaSpinner;
      tipIndex: number;
    };
  }
}
