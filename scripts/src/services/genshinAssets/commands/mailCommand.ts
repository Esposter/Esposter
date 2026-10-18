import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildMailPublication } from "#src/services/genshinAssets/mail/buildMailPublication";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const mailCommand = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the mail table from the dump to the game data: each mail's text ids, expiry and reward items, and the birthday mail table",
    name: "mail",
  },
  run: async ({ args }) => {
    const { note, publication } = buildMailPublication();
    console.log(note);
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication,
        scopes: [GameDataset.Mail, GameDataset.MailText],
      }),
    );
  },
});
