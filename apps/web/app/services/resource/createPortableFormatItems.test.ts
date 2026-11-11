import type { PortableFormat } from "@/models/resource/PortableFormat";

import { PortableFormatKind } from "@/models/resource/PortableFormatKind";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { createPortableFormatItems } from "@/services/resource/createPortableFormatItems";
import { describe, expect, test, vi } from "vitest";

describe(createPortableFormatItems, () => {
  const createFormat = (label: string): PortableFormat => ({ icon: `i-test:${label}`, import: vi.fn(), label });

  test("lists nothing for a resource with no formats", () => {
    expect.hasAssertions();

    expect(createPortableFormatItems("Import", UiIconMeaning.Upload, [], PortableFormatKind.Import)).toStrictEqual([]);
  });

  test("is the command itself for a lone format", () => {
    expect.hasAssertions();

    const [item] = createPortableFormatItems(
      "Import",
      UiIconMeaning.Upload,
      [createFormat("Markdown")],
      PortableFormatKind.Import,
    );

    expect(item?.title).toBe("Import Markdown");
    expect(item?.children).toBeUndefined();
  });

  test("is one group named by its verb for several formats, each child running its own format against its own icon", async () => {
    expect.hasAssertions();

    const csv = createFormat("Csv");
    const items = createPortableFormatItems(
      "Import",
      UiIconMeaning.Upload,
      [csv, createFormat("Json")],
      PortableFormatKind.Import,
    );
    const [item] = items;
    await item?.children?.[0]?.onClick?.();

    expect(items).toHaveLength(1);
    expect(item?.title).toBe("Import");
    expect(item?.children?.map(({ icon, title }) => ({ icon, title }))).toStrictEqual([
      { icon: "i-test:Csv", title: "Csv" },
      { icon: "i-test:Json", title: "Json" },
    ]);
    expect(csv.import).toHaveBeenCalledOnce();
  });
});
