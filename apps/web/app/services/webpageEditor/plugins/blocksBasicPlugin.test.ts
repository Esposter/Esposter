// @vitest-environment happy-dom
import grapesJS, { usePlugin } from "grapesjs";
import { describe, expect, test } from "vitest";

import { blocksBasicPlugin } from "@/services/webpageEditor/plugins/blocksBasicPlugin";

const createEditor = (flexGrid?: boolean) =>
  grapesJS.init({ headless: true, plugins: [usePlugin(blocksBasicPlugin, { flexGrid })], storageManager: false });

describe(blocksBasicPlugin, () => {
  test("registers the upstream block ids in the Basic category", () => {
    expect.hasAssertions();

    const editor = createEditor();
    const blocks = editor.Blocks.getAll();

    expect(blocks.map((block) => block.getId())).toStrictEqual([
      "column1",
      "column2",
      "column3",
      "column3-7",
      "text",
      "link",
      "image",
      "video",
      "map",
    ]);
    expect(blocks.map((block) => block.getCategoryLabel())).toStrictEqual(blocks.map(() => "Basic"));
  });

  test("#52 video block carries no default src, so dropping it requests no file", () => {
    expect.hasAssertions();

    const editor = createEditor();

    expect(editor.Blocks.get("video")?.get("content")).toStrictEqual({
      style: { height: "350px", width: "615px" },
      type: "video",
    });
  });

  test("flexGrid rows and cells use flexbox and the flex-basis resizer key", () => {
    expect.hasAssertions();

    const editor = createEditor(true);
    const content = editor.Blocks.get("column2")?.get("content");

    expect(content).toContain("data-gjs-stylable-require='[\"flex-basis\"]'");
    expect(content).toContain("data-gjs-unstylable='[\"width\"]'");
    expect(content).toContain("keyWidth");
  });

  test("without flexGrid the 3/7 columns are sized by width", () => {
    expect.hasAssertions();

    const editor = createEditor();
    const content = editor.Blocks.get("column3-7")?.get("content");

    expect(content).toContain("style='width: 30%;'");
    expect(content).toContain("display: table-cell");
  });
});
