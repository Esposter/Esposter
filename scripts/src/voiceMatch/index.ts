import { checkReferences } from "#src/services/voiceMatch/checkReferences";
import { CHECK_FLAG, WRITE_FLAG } from "#src/services/voiceMatch/constants";
import { measureRoster } from "#src/services/voiceMatch/measureRoster";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { VoiceLanguage } from "genshin-persona/src/models/VoiceLanguage.ts";
import { checkIsVoiceLanguage } from "genshin-persona/src/services/checkIsVoiceLanguage.ts";

// The dub first, then any characters to measure alone; the flags anywhere
const flags = new Set([CHECK_FLAG, WRITE_FLAG]);
const [language = VoiceLanguage.English, ...names] = process.argv.slice(2).filter((argument) => !flags.has(argument));
if (!checkIsVoiceLanguage(language))
  throw new InvalidOperationError(
    Operation.Read,
    "voice-match",
    `${language} is not a dub: ${Object.values(VoiceLanguage).join(", ")}`,
  );

if (process.argv.includes(CHECK_FLAG)) await checkReferences();
else await measureRoster(language, names, process.argv.includes(WRITE_FLAG));
