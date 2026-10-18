import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { mailCommand } from "#src/services/genshinAssets/commands/mailCommand";
import { runCommand } from "citty";
import { GameDataset } from "genshin-world";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/gameData/publishGameDataStep"), () => ({
  publishGameDataStep: vi.fn<(options: unknown) => Promise<string>>(() => Promise.resolve("published")),
}));
vi.mock(import("#src/services/genshinAssets/mail/buildMailPublication"), () => ({
  buildMailPublication: () => ({
    note: "",
    publication: { indexes: { "mail/mail": {} }, objects: { "mailText/ChineseSimplified": {} } },
  }),
}));

describe("mailCommand", () => {
  // The mail texts are published under their own dataset, and the publish refuses a record outside the scopes it names
  test("names the mail text scope beside the mail's, so the texts publish", async () => {
    expect.hasAssertions();

    await runCommand(mailCommand, { rawArgs: ["--dry-run"] });

    expect(vi.mocked(publishGameDataStep).mock.calls[0]?.[0].scopes).toStrictEqual([
      GameDataset.Mail,
      GameDataset.MailText,
    ]);
  });
});
