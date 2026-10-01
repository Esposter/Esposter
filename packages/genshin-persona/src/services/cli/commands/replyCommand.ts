import type { SubCommandsDef } from "citty";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { getStatusReport } from "#src/services/cli/getStatusReport";
import { readGenshinContext } from "#src/services/cli/readGenshinContext";
import { getCanonicalLanguage } from "#src/generated/genshinText/services/getCanonicalLanguage";
import { getLanguageDisplayName } from "#src/generated/genshinText/services/getLanguageDisplayName";
import { DEFAULT_LANGUAGE } from "#src/services/constants";
import { readVoiceLanguage } from "#src/services/readVoiceLanguage";
import { writeReplyLanguage } from "#src/services/writeReplyLanguage";
import { defineCommand } from "citty";

export const replyCommand: SubCommandsDef[string] = defineCommand({
  meta: { name: GenshinVerb.Reply },
  run: async ({ args }) => {
    const context = await readGenshinContext();
    const { language, strings } = context;
    const name = args._.join(" ");
    if (!name) {
      console.log(strings.status(await getStatusReport(context)));
      return;
    }
    // Anything the model can write is a legal reply language, so this is not held to the data package's fifteen;
    // The canonical spelling is taken where it names one of them, so the common case reads as the language verb's
    const replyLanguage = getCanonicalLanguage(name) ?? name;
    writeReplyLanguage(replyLanguage);
    console.log(strings.replyLanguageSet(getLanguageDisplayName(replyLanguage, language)));
    if (replyLanguage !== DEFAULT_LANGUAGE && readVoiceLanguage()) console.log(strings.replyLanguageSilencesVoice);
  },
});
