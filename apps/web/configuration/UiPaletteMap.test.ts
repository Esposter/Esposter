import { UiStyle, UiStyles } from "@/models/ui/UiStyle";
import { UiToken } from "@/models/ui/UiToken";
import { ResolvedThemeModes } from "@/models/vuetify/ResolvedThemeMode";
import { UiPaletteMap } from "@@/configuration/UiPaletteMap";
import { STANDARD_SUNK_MIX_PERCENTAGE, STANDARD_TONAL_MIX_PERCENTAGE } from "@@/configuration/UiStyleMap";
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
// `color-mix(in srgb, <hexColor> <percentage>%, <otherHexColor>)` as a six-digit hex colour, channel by channel
const getMixedHexColor = (hexColor: string, percentage: number, otherHexColor: string) =>
  `#${[1, 3, 5]
    .map((index) =>
      Math.round(
        (Number.parseInt(hexColor.slice(index, index + 2), 16) * percentage +
          Number.parseInt(otherHexColor.slice(index, index + 2), 16) * (100 - percentage)) /
          100,
      )
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
// WCAG's contrast ratio between two six-digit hex colours, whichever is lighter
const getContrastRatio = (hexColor: string, otherHexColor: string) => {
  const luminance = getRelativeLuminance(hexColor);
  const otherLuminance = getRelativeLuminance(otherHexColor);
  return (Math.max(luminance, otherLuminance) + 0.05) / (Math.min(luminance, otherLuminance) + 0.05);
};

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
  const surfaceTokens = [UiToken.Background, UiToken.Lifted, UiToken.Panel] as const;

  test.each(
    UiStyles.flatMap((uiStyle) =>
      ResolvedThemeModes.flatMap((themeMode) =>
        foregroundTokens.flatMap((foregroundToken) =>
          surfaceTokens.map((surfaceToken) => [uiStyle, themeMode, foregroundToken, surfaceToken] as const),
        ),
      ),
    ),
  )("%s %s: %s on %s meets the WCAG AA contrast ratio", (uiStyle, themeMode, foregroundToken, surfaceToken) => {
    expect.hasAssertions();

    const palette = UiPaletteMap[uiStyle][themeMode];

    expect(getContrastRatio(palette[foregroundToken], palette[surfaceToken])).toBeGreaterThanOrEqual(4.5);
  });

  // The accent and danger buttons draw their label in the background colour on a fill of their own
  test.each(
    UiStyles.flatMap((uiStyle) =>
      ResolvedThemeModes.flatMap((themeMode) =>
        [UiToken.Accent, UiToken.Error].map((fillToken) => [uiStyle, themeMode, fillToken] as const),
      ),
    ),
  )("%s %s: the background on %s meets the WCAG AA contrast ratio", (uiStyle, themeMode, fillToken) => {
    expect.hasAssertions();

    const palette = UiPaletteMap[uiStyle][themeMode];

    expect(getContrastRatio(palette[UiToken.Background], palette[fillToken])).toBeGreaterThanOrEqual(4.5);
  });

  // Standard's field and button fills are translucent tones over whatever they sit on: a field's text on the text colour
  // Mixed in, a tonal button's accent label on the accent mixed in
  test.each(
    ResolvedThemeModes.flatMap((themeMode) =>
      surfaceTokens.flatMap((surfaceToken) =>
        (
          [
            [UiToken.Text, STANDARD_SUNK_MIX_PERCENTAGE],
            [UiToken.Accent, STANDARD_TONAL_MIX_PERCENTAGE],
          ] as const
        ).map(([foregroundToken, percentage]) => [themeMode, foregroundToken, percentage, surfaceToken] as const),
      ),
    ),
  )(
    "standard %s: %s on its %s%% tone over %s meets the WCAG AA contrast ratio",
    (themeMode, foregroundToken, percentage, surfaceToken) => {
      expect.hasAssertions();

      const palette = UiPaletteMap[UiStyle.Standard][themeMode];

      expect(
        getContrastRatio(
          palette[foregroundToken],
          getMixedHexColor(palette[foregroundToken], percentage, palette[surfaceToken]),
        ),
      ).toBeGreaterThanOrEqual(4.5);
    },
  );
});
