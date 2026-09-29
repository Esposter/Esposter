import { checkReferences } from "#src/services/voiceMatch/checkReferences";
import { measureRoster } from "#src/services/voiceMatch/measureRoster";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand, runMain } from "citty";
import { VoiceLanguage } from "genshin-persona/src/models/VoiceLanguage.ts";
import { checkIsVoiceLanguage } from "genshin-persona/src/services/checkIsVoiceLanguage.ts";

await runMain(
  defineCommand({
    args: {
      language: {
        default: VoiceLanguage.English,
        description: `The dub, one of ${Object.values(VoiceLanguage).join(", ")}, then any characters to measure alone`,
        required: false,
        type: "positional",
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
      description: "Choose each character's reference line for the persona's cloned voice",
      name: "ai:voice-match",
    },
    run: async ({ args }) => {
      if (!checkIsVoiceLanguage(args.language))
        throw new InvalidOperationError(
          Operation.Read,
          "voice-match",
          `${args.language} is not a dub: ${Object.values(VoiceLanguage).join(", ")}`,
        );

      if (args.check) await checkReferences();
      else await measureRoster(args.language, args._.slice(1), args.write);
    },
  }),
);
