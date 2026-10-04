import { checkReferences } from "#src/services/voiceMatch/checkReferences";
import { measureRoster } from "#src/services/voiceMatch/measureRoster";
import { defineCommand, runMain } from "citty";
import { VoiceLanguage } from "genshin-persona/src/models/VoiceLanguage.ts";

await runMain(
  defineCommand({
    args: {
      language: {
        default: VoiceLanguage.English,
        description: "The dub the lines are measured in",
        options: Object.values(VoiceLanguage),
        type: "enum",
      },
      write: { default: false, description: "Regenerate PersonaReferenceMap from what was measured", type: "boolean" },
      // Asks the wiki for every stem the map already holds, in every dub, instead of measuring
      check: {
        default: false,
        description: "Measure nothing: ask the wiki whether each character's reference line still exists in every dub",
        type: "boolean",
      },
    },
    meta: {
      description:
        "Choose each character's reference line for the persona's cloned voice, the roster's or the characters named",
      name: "ai:voice-match",
    },
    run: async ({ args }) => {
      if (args.check) await checkReferences();
      else await measureRoster(args.language, args._, args.write);
    },
  }),
);
