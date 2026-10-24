import { Dungeons } from "#shared/models/dungeons/data/Dungeons";
import { toLocalDungeons } from "@/services/dungeons/toLocalDungeons";
import { describe, expect, test } from "vitest";

// The read runs on every load, so a save that cannot be parsed must start a fresh game rather than leave the page with
// Nothing to show. A fresh game gets a new id, so it is checked by its settings and missing save, not compared whole
describe(toLocalDungeons, () => {
  test("starts a fresh game when nothing is stored", () => {
    expect.hasAssertions();

    const dungeons = toLocalDungeons(null);

    expect(dungeons.settings).toStrictEqual(new Dungeons().settings);
    expect(dungeons.save).toBeUndefined();
  });

  test("starts a fresh game when the stored text is not JSON", () => {
    expect.hasAssertions();

    const dungeons = toLocalDungeons("{not json");

    expect(dungeons.settings).toStrictEqual(new Dungeons().settings);
    expect(dungeons.save).toBeUndefined();
  });

  test("starts a fresh game when the stored JSON is not a save", () => {
    expect.hasAssertions();

    const dungeons = toLocalDungeons(JSON.stringify({ settings: "not settings" }));

    expect(dungeons.settings).toStrictEqual(new Dungeons().settings);
    expect(dungeons.save).toBeUndefined();
  });

  test("keeps a valid stored save", () => {
    expect.hasAssertions();

    const savedDungeons = new Dungeons();

    expect(toLocalDungeons(JSON.stringify(savedDungeons)).id).toBe(savedDungeons.id);
  });
});
