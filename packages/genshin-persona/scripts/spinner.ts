import { findCharacterByName } from "#src/services/findCharacterByName";
import { readInterfaceLanguage } from "#src/services/readInterfaceLanguage";
import { readPersonaCard } from "#src/services/readPersonaCard";
import { readRoster } from "#src/services/readRoster";
import { readSpinner } from "#src/services/readSpinner";
import { registerQuietExit } from "#src/services/registerQuietExit";
import { defineCommand, runMain } from "citty";

// The session's spinner for the hooks module, as JSON: its verbs and the character's lines under their name. Run off
// The session start's own path, since the lines cost the data package or the wiki. The character arrives as the
// English name, which is the identity, and the roster it is looked up in is the interface language's — so the label
// Is the name that language spells them by
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
    meta: { description: "Print the spinner for the session's character", name: "spinner" },
    run: async ({ args }) => {
      const language = readInterfaceLanguage();
      const character = args.name ? findCharacterByName(readRoster(language), args.name) : undefined;
      if (character)
        console.log(JSON.stringify(await readSpinner(character, await readPersonaCard(character.name), language)));
    },
  }),
);
