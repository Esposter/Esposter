import { GameTextLoaderMap } from "#src/generated/GameTextLoaderMap";
import { GameTextKey } from "#src/models/GameTextKey";
import { matchGameLanguage } from "#src/services/matchGameLanguage";
import { describe, expect, test } from "vitest";

describe("gameTextKey", () => {
  test("the challenge panel shows the game's words in the reader's language", async () => {
    expect.hasAssertions();

    const gameText = await GameTextLoaderMap[matchGameLanguage(["zh-CN", "en"])]();

    expect(gameText[GameTextKey.MoonfinChallengeTitle]).toBe("钓获月光鳍");
    expect(gameText[GameTextKey.MoonfinChallengeCaught]).toBe("钓获月光鳍数量：#1#");
    expect(gameText[GameTextKey.MoonfinChallengeTensionTime]).toBe("保持在最佳张力区域时长：#1#秒");
    expect(gameText[GameTextKey.AbandonChallenge]).toBe("中断挑战");
  });
});
