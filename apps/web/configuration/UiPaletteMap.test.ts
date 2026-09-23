import { UiTheme } from "@/models/ui/UiTheme";
import { UiToken } from "@/models/ui/UiToken";
import { UiPaletteMap } from "@@/configuration/UiPaletteMap";
import { describe, expect, test } from "vitest";
// WCAG's relative luminance, from the linear value of each of a six-digit hex colour's channels
const getLinearChannel = (hexColor: string, index: number) => {
  const channel = Number.parseInt(hexColor.slice(index, index + 2), 16) / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
};
const getRelativeLuminance = (hexColor: string) =>
  0.2126 * getLinearChannel(hexColor, 1) +
  0.7152 * getLinearChannel(hexColor, 3) +
  0.0722 * getLinearChannel(hexColor, 5);

describe("uiPaletteMap", () => {
  const foregroundTokens = [
    UiToken.Accent,
    UiToken.Error,
    UiToken.Info,
    UiToken.Muted,
    UiToken.Success,
    UiToken.Text,
    UiToken.Warning,
  ] as const;
  const surfaceTokens = [UiToken.Background, UiToken.Panel] as const;

  test.each(
    Object.values(UiTheme).flatMap((uiTheme) =>
      foregroundTokens.flatMap((foregroundToken) =>
        surfaceTokens.map((surfaceToken) => [uiTheme, foregroundToken, surfaceToken] as const),
      ),
    ),
  )("%s: %s on %s meets the WCAG AA contrast ratio", (uiTheme, foregroundToken, surfaceToken) => {
    expect.hasAssertions();

    const foregroundLuminance = getRelativeLuminance(UiPaletteMap[uiTheme][foregroundToken]);
    const surfaceLuminance = getRelativeLuminance(UiPaletteMap[uiTheme][surfaceToken]);

    expect(
      (Math.max(foregroundLuminance, surfaceLuminance) + 0.05) /
        (Math.min(foregroundLuminance, surfaceLuminance) + 0.05),
    ).toBeGreaterThanOrEqual(4.5);
  });
});
