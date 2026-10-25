import type { Item } from "@/models/shared/Item";

import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { getResourceBladeItems } from "@/services/resource/getResourceBladeItems";
import { ResourceType } from "@esposter/db-schema";
import { describe, expect, test, vi } from "vitest";

const createCommands = () => ({
  delete: vi.fn<() => void>(),
  duplicate: vi.fn<() => void>(),
  exportDatasetCsv: vi.fn<() => void>(),
  read: vi.fn<() => void>(),
  rename: vi.fn<() => void>(),
  unpublish: vi.fn<() => void>(),
  versionHistory: vi.fn<() => void>(),
});

const getTitles = (items: Item[]) => items.map(({ title }) => title);

const getOptions = () => ({
  commands: createCommands(),
  exportFormats: [],
  importFormats: [],
  isDuplicatePending: false,
  isPending: false,
  isPublicationPending: false,
  isPublished: false,
});

describe(getResourceBladeItems, () => {
  const resource = createResourceListItem({ type: ResourceType.Program });

  // Unpublish takes a publication down, so it is offered only while there is one
  test("offers Unpublish only while the resource is published", () => {
    expect.hasAssertions();

    expect(getTitles(getResourceBladeItems(resource, { ...getOptions(), isPublished: true }))).toContain("Unpublish");
    expect(getTitles(getResourceBladeItems(resource, getOptions()))).not.toContain("Unpublish");
  });

  // A program's dataset is its CSV, so the command is offered for it; a sheet's portable export already covers it
  test("offers Export CSV only for a dataset provider without a portable export", () => {
    expect.hasAssertions();

    const sheet = createResourceListItem({ type: ResourceType.Sheet });

    expect(getTitles(getResourceBladeItems(resource, getOptions()))).toContain("Export CSV");
    expect(getTitles(getResourceBladeItems(sheet, getOptions()))).not.toContain("Export CSV");
  });

  test("names each portable format by its verb and its label", () => {
    expect.hasAssertions();

    const exportCsv = vi.fn<() => Promise<void>>();
    const items = getResourceBladeItems(resource, {
      ...getOptions(),
      exportFormats: [{ export: exportCsv, icon: "i-mdi:file", label: "Csv" }],
    });
    const exportItem = items.find(({ title }) => title === "Export Csv");
    exportItem?.onClick?.();

    expect(exportCsv).toHaveBeenCalledTimes(1);
  });

  test("disables Refresh while the resource is pending", () => {
    expect.hasAssertions();

    const refresh = getResourceBladeItems(resource, { ...getOptions(), isPending: true }).find(
      ({ title }) => title === "Refresh",
    );

    expect(refresh?.disabled).toBe(true);
  });

  // Delete is the danger that closes the menu, so it is set apart from the commands above it
  test("ends with Delete, set apart by a group break and in the danger colour", () => {
    expect.hasAssertions();

    const items = getResourceBladeItems(resource, getOptions());
    const deleteItem = items.at(-1);

    expect({
      isDanger: deleteItem?.isDanger,
      isGroupStart: deleteItem?.isGroupStart,
      title: deleteItem?.title,
    }).toStrictEqual({ isDanger: true, isGroupStart: true, title: "Delete" });
  });
});
