import { AgentConsoleThemeType } from "@/models/agentConsole/AgentConsoleThemeType";
import { GENSHIN_CHARACTER_LINE_PREFIX } from "@/services/agentConsole/constants";
import { AgentConsoleThemeMap } from "@/services/agentConsole/themes/AgentConsoleThemeMap";
import { describe, expect, test } from "vitest";

describe("AgentConsoleThemeMap", () => {
  const name = "name";
  const characterLine = `${GENSHIN_CHARACTER_LINE_PREFIX}${name}`;

  test("presents a session the persona plugin started as its character, off the plugin's own line", () => {
    expect.hasAssertions();

    expect(AgentConsoleThemeMap[AgentConsoleThemeType.Genshin].getAvatar(`${name}\n${characterLine}`)).toBe(name);
  });

  test.each([
    [AgentConsoleThemeType.Default, characterLine],
    [AgentConsoleThemeType.Genshin, name],
  ])("%s theme presents no one from %j", (themeType, sessionStartContext) => {
    expect.hasAssertions();

    expect(AgentConsoleThemeMap[themeType].getAvatar(sessionStartContext)).toBe("");
  });
});
