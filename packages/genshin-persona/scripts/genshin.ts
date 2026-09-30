import { GenshinVerbs } from "#src/models/GenshinVerb";
import { genshinCommand } from "#src/services/cli/commands/genshinCommand";
import { readInterfaceLanguage } from "#src/services/readInterfaceLanguage";
import { readLocalization } from "#src/services/readLocalization";
import { runMain } from "citty";

// Every line the plugin prints is in the interface language, so a verb it does not know, or none, or a request for help,
// Is answered with its own usage line, and exits before citty would add an English one of its own
await runMain(genshinCommand, {
  showUsage: async () => {
    const { strings } = await readLocalization(readInterfaceLanguage());
    console.error(strings.usage(GenshinVerbs.join(" | ")));
    process.exit(1);
  },
});
