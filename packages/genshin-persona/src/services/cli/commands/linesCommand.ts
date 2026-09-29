import type { SubCommandsDef } from "citty";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { checkIsOwnVoiceLine } from "#src/services/checkIsOwnVoiceLine";
import { getRosterLine } from "#src/services/cli/getRosterLine";
import { readGenshinContext } from "#src/services/cli/readGenshinContext";
import { readNamedCharacter } from "#src/services/cli/readNamedCharacter";
import { readVoiceLines } from "#src/services/readVoiceLines";
import { defineCommand } from "citty";

export const linesCommand: SubCommandsDef[string] = defineCommand({
  meta: { name: GenshinVerb.Lines },
  run: async ({ args }) => {
    const context = await readGenshinContext();
    const { language } = context;
    const name = args._.join(" ");
    const character = readNamedCharacter(context, name);
    if (!character) return;

    console.log(`${getRosterLine(character)}\n${character.description}`);
    const voiceLines = await readVoiceLines(character.name, language);
    for (const { text, title } of voiceLines.filter((line) => checkIsOwnVoiceLine(line)))
      console.log(`- ${title}: ${text}`);
  },
});
