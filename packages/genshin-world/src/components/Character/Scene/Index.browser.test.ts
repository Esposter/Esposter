import CharacterScene from "#src/components/Character/Scene/Index.vue";
import { Element } from "#src/models/Element";
import { ElementNebulaMap } from "#src/services/character/ElementNebulaMap";
import { CharacterMenuTab } from "genshin-interface";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";

describe("characterScene", () => {
  test("the chosen character stands in the middle over its element's background", () => {
    expect.hasAssertions();

    render(CharacterScene, { props: { element: Element.Pyro, tab: CharacterMenuTab.Attributes } });
    const scene = document.querySelector<HTMLElement>(".scene");

    expect(scene?.style.getPropertyValue("--nebula-centre")).toBe(ElementNebulaMap[Element.Pyro].centre);
    expect(scene?.style.getPropertyValue("--nebula-edge")).toBe(ElementNebulaMap[Element.Pyro].edge);
  });
});
