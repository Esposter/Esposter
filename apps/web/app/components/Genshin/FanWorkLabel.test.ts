import GenshinFanWorkLabel from "@/components/Genshin/FanWorkLabel.vue";
import { describe, expect, test } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

describe(GenshinFanWorkLabel, () => {
  test("the world's page carries the fan-made label", async () => {
    expect.hasAssertions();

    const html = await renderToString(createSSRApp({ render: () => h(GenshinFanWorkLabel) }));

    expect(html).toBe(
      "<p text-xs text-text px-2 py-1 bg-background pointer-events-none bottom-2 right-2 absolute z-2> Unofficial, non-commercial fan work. Not made by or affiliated with the game&#39;s publisher. </p>",
    );
  });
});
