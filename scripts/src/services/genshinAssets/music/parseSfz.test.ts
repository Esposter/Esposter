import { parseSfz } from "#src/services/genshinAssets/music/parseSfz";
import { describe, expect, test } from "vitest";

describe(parseSfz, () => {
  test("reads each region a note's start plays with what its scopes give it", () => {
    expect.hasAssertions();

    const text = `// A mapping
<control> default_path=Keys\\Piano\\
<global> volume=2 lovel=1
<group> hivel=63 /* the soft layer */
<region> sample=Soft C4.wav key=c4 tune=-5
<region> sample=Soft C4 b.wav key=60 seq_position=2
<group> lovel=64 trigger=release
<region> sample=Release.wav key=60
<group> lovel=64 hivel=127 transpose=1
<region> sample=Loud.wav lokey=f#3 hikey=70 pitch_keycenter=65 offset=12 volume=-3`;

    expect(parseSfz(text, "Strings")).toStrictEqual([
      {
        gain: 2,
        highKey: 60,
        highVelocity: 63,
        keyCenter: 60,
        lowKey: 60,
        lowVelocity: 1,
        offset: 0,
        path: "Strings/Keys/Piano/Soft C4.wav",
        tune: -5,
      },
      {
        gain: -3,
        highKey: 70,
        highVelocity: 127,
        keyCenter: 65,
        lowKey: 54,
        lowVelocity: 64,
        offset: 12,
        path: "Strings/Keys/Piano/Loud.wav",
        tune: 100,
      },
    ]);
  });

  test("gives crossfaded layers the velocities where each is the louder, and skips a region holding no key", () => {
    expect.hasAssertions();

    const text = `<region> sample=Soft.wav key=60 xfout_lovel=70 xfout_hivel=100
<region> sample=Loud.wav key=60 xfin_lovel=70 xfin_hivel=100
<region> sample=Pedal.wav lokey=127 hikey=0`;

    expect(
      parseSfz(text, "").map(({ highVelocity, lowVelocity, path }) => ({ highVelocity, lowVelocity, path })),
    ).toStrictEqual([
      { highVelocity: 85, lowVelocity: 1, path: "Soft.wav" },
      { highVelocity: 127, lowVelocity: 86, path: "Loud.wav" },
    ]);
  });
});
