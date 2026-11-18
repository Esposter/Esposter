import { getPageWidth } from "#src/services/genshinParity/shared/getPageWidth";
import { describe, expect, test } from "vitest";

describe(getPageWidth, () => {
  test("a World screen's page is opened as tall as the interface", () => {
    expect.hasAssertions();

    const width = getPageWidth({
      isWorldScreen: true,
      referenceHeight: 1080,
      referenceWidth: 1920,
      requestedWidth: 480,
    });

    expect(width).toBe(1920);
  });

  test("a World screen's page takes its reference's aspect at the interface's height", () => {
    expect.hasAssertions();

    const width = getPageWidth({
      isWorldScreen: true,
      referenceHeight: 1600,
      referenceWidth: 2560,
      requestedWidth: 480,
    });

    expect(width).toBe(1728);
  });

  test("a World screen's page asked wider than the interface keeps the width asked", () => {
    expect.hasAssertions();

    const width = getPageWidth({
      isWorldScreen: true,
      referenceHeight: 1080,
      referenceWidth: 1920,
      requestedWidth: 2560,
    });

    expect(width).toBe(2560);
  });

  test("a page on any other screen is opened at the width asked", () => {
    expect.hasAssertions();

    const width = getPageWidth({
      isWorldScreen: false,
      referenceHeight: 1080,
      referenceWidth: 1920,
      requestedWidth: 480,
    });

    expect(width).toBe(480);
  });
});
