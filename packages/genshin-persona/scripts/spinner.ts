import { findCharacterByName } from "#src/services/findCharacterByName";
import { readInterfaceLanguage } from "#src/services/readInterfaceLanguage";
import { readPersonaCard } from "#src/services/readPersonaCard";
import { readRoster } from "#src/services/readRoster";
import { registerQuietExit } from "#src/services/registerQuietExit";
import { writeSessionSpinner } from "#src/services/writeSessionSpinner";
import { defineCommand, runMain } from "citty";

// Spawned detached by the session-start hook, which must not wait on it: this session's character's lines are read
// And the spinner rewritten while the person reads the card, where `setup` opted the settings in. The character
// Arrives as the English name, which is the identity, and the roster it is looked up in is the interface
// Language's — so the label written is the name that language spells them by
registerQuietExit();
await runMain(
  defineCommand({
    args: {
      name: {
        default: "",
        description: "The session's character, by English name",
        required: false,
        type: "positional",
      },
    },
    meta: { description: "Rewrite the spinner under the session's character", name: "spinner" },
    run: async ({ args }) => {
      const language = readInterfaceLanguage();
      const character = args.name ? findCharacterByName(readRoster(language), args.name) : undefined;
      if (character) await writeSessionSpinner(character, await readPersonaCard(character.name), language);
    },
  }),
);
