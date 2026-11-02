// @vitest-environment nuxt
import { MimeType } from "#shared/models/file/MimeType";
import { createElementSvg } from "@/services/capture/createElementSvg";
import { describe, expect, test, vi } from "vitest";

describe(createElementSvg, () => {
  test("wraps cloned text in a foreign object at the canvas size", async () => {
    expect.hasAssertions();

    const element = document.createElement("div");
    element.style.color = "red";
    element.textContent = "A node";
    vi.spyOn(window, "getComputedStyle").mockReturnValue(element.style);
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 120, 80));
    const svg = await createElementSvg(element);
    const parsedSvg = new DOMParser().parseFromString(await svg.text(), "image/svg+xml");
    const foreignObject = parsedSvg.querySelector("foreignObject");
    const exportedCanvas = foreignObject?.querySelector("div");

    expect(svg.type).toBe(MimeType.Svg);
    expect(parsedSvg.documentElement.getAttribute("width")).toBe("120");
    expect(exportedCanvas?.textContent).toBe("A node");
    expect(exportedCanvas?.style.color).toBe("red");
  });
});
