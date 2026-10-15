import { AgentConsoleThemeType } from "@/models/agentConsole/AgentConsoleThemeType";
import { UiToken } from "@/models/ui/UiToken";
import { GENSHIN_CHARACTER_LINE_PREFIX, GENSHIN_ELEMENT_LINE_PREFIX } from "@/services/agentConsole/constants";
import { AgentConsoleThemeMap } from "@/services/agentConsole/themes/AgentConsoleThemeMap";
import { describe, expect, test } from "vitest";

describe("agentConsoleThemeMap", () => {
  const name = "name";
  const characterLine = `${GENSHIN_CHARACTER_LINE_PREFIX}${name}`;
  const elementLine = `${GENSHIN_ELEMENT_LINE_PREFIX}Anemo`;

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

  test("sets the Genshin theme accent from the element line", () => {
    expect.hasAssertions();

    expect(AgentConsoleThemeMap[AgentConsoleThemeType.Genshin].getPalette(elementLine)).toEqual({
      [UiToken.Accent]: "#33ccb3",
    });
  });

  test.each([`${GENSHIN_ELEMENT_LINE_PREFIX}Unknown`, characterLine])("sets no palette from %j", (context) => {
    expect.hasAssertions();

    expect(AgentConsoleThemeMap[AgentConsoleThemeType.Genshin].getPalette(context)).toEqual({});
  });
});
