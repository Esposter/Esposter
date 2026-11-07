import { readSpriteRectangle } from "#src/services/genshinAssets/sprites/readSpriteRectangle";
import { describe, expect, test } from "vitest";

describe(readSpriteRectangle, () => {
  // A Sprite's dump as AnimeStudio writes it, cut to the fields the reader takes: the login's `UI_AimCrossB_00`, one of the
  // sprites its atlas holds, measured from the atlas's bottom edge
  const FIXTURE_SPRITE_DUMP = {
    m_RD: {
      settingsRaw: { packed: 1, packingMode: "Rectangle", packingRotation: "None", settingsRaw: 67 },
      texture: {
        IsNull: false,
        m_FileID: 0,
        m_PathID: -797957378582952315,
        Name: "SpriteAtlasTexture-ui_sprite_general_ui-1024x1024-fmt25",
      },
      textureRect: { height: 18, width: 10, x: 0, y: 981 },
    },
  };

  test("reads the atlas a sprite is cut from and its rectangle inside that atlas", () => {
    expect.hasAssertions();

    expect(readSpriteRectangle(FIXTURE_SPRITE_DUMP)).toStrictEqual({
      atlas: "SpriteAtlasTexture-ui_sprite_general_ui-1024x1024-fmt25",
      rectangle: { height: 18, width: 10, x: 0, y: 981 },
    });
  });

  test("refuses a sprite whose atlas is null", () => {
    expect.hasAssertions();

    expect(() =>
      readSpriteRectangle({
        m_RD: { ...FIXTURE_SPRITE_DUMP.m_RD, texture: { IsNull: true, m_FileID: 0, m_PathID: 0, Name: "" } },
      }),
    ).toThrow("names no atlas");
  });

  test("refuses a sprite packed rotated, whose rectangle is not its pixels' own", () => {
    expect.hasAssertions();

    expect(() =>
      readSpriteRectangle({
        m_RD: {
          ...FIXTURE_SPRITE_DUMP.m_RD,
          settingsRaw: { packed: 1, packingMode: "Rectangle", packingRotation: "Rotated", settingsRaw: 0 },
        },
      }),
    ).toThrow("packed rotated");
  });
});
