import type { Context, ResolvedLayout, ResolvedRegion } from "vue-editor-layout-headless";

import { EmailContentKey } from "@/models/emailEditor/EmailContentKey";
import { EmailView } from "@/models/pageBuilder/EmailView";
import { emailLayout, emailPanelNameMap } from "@/services/emailEditor/emailLayout";
import { PAGE_BUILDER_SELECTION_KIND_MAP } from "@/services/pageBuilder/pageBuilderLayout";
import { assert, describe, expect, test } from "vitest";
import {
  checkLayout,
  getDefaultReaderState,
  RegionPresentation,
  resolveLayout,
  SizeClass,
  toggleRegion,
} from "vue-editor-layout-headless";

const getRegion = (resolvedLayout: ResolvedLayout, regionId: string): ResolvedRegion => {
  const region = resolvedLayout.regions.find(({ id }) => id === regionId);
  assert.exists(region);
  return region;
};

describe("emailLayout", () => {
  const barRegionId = "bar";
  const blocksRegionId = "blocks";
  const inspectorRegionId = "inspector";
  const registeredContentKeys = Object.values(EmailContentKey);
  const selectionKinds = Object.values(PAGE_BUILDER_SELECTION_KIND_MAP);
  const designContext: Context = {
    mode: EmailView.Design,
    selectionCount: 0,
    selectionKind: PAGE_BUILDER_SELECTION_KIND_MAP.Nothing,
    tool: "",
  };
  const nodeContext: Context = {
    ...designContext,
    selectionCount: 1,
    selectionKind: PAGE_BUILDER_SELECTION_KIND_MAP.Node,
  };
  const previewContext: Context = { ...designContext, mode: EmailView.Preview };
  const readerState = getDefaultReaderState();

  test("an editor's layout passes the layout check", () => {
    expect.hasAssertions();

    expect(checkLayout(emailLayout, selectionKinds, registeredContentKeys)).toStrictEqual([]);
  });

  test("every panel has a tab title", () => {
    expect.hasAssertions();

    const untitledPanelIds = emailLayout.panels.filter(({ id }) => !emailPanelNameMap[id]).map(({ id }) => id);

    expect(untitledPanelIds).toStrictEqual([]);
  });

  test("preview removes the editing regions", () => {
    expect.hasAssertions();

    const designLayout = resolveLayout(emailLayout, designContext, SizeClass.Expanded, readerState);
    const previewLayout = resolveLayout(emailLayout, previewContext, SizeClass.Expanded, readerState);

    expect(designLayout.regions.map(({ id }) => id)).toStrictEqual([barRegionId, blocksRegionId, inspectorRegionId]);
    expect(previewLayout.regions.map(({ id }) => id)).toStrictEqual([barRegionId]);
  });

  test("nothing selected shows the email's settings", () => {
    expect.hasAssertions();

    const resolvedLayout = resolveLayout(emailLayout, designContext, SizeClass.Expanded, readerState);

    expect(getRegion(resolvedLayout, inspectorRegionId).panels).toStrictEqual([
      { contentKey: EmailContentKey.Settings, id: "settings" },
    ]);
  });

  test("a node selection offers Content and Style only", () => {
    expect.hasAssertions();

    const resolvedLayout = resolveLayout(emailLayout, nodeContext, SizeClass.Expanded, readerState);

    expect(getRegion(resolvedLayout, inspectorRegionId).panels).toStrictEqual([
      { contentKey: EmailContentKey.Content, id: "content" },
      { contentKey: EmailContentKey.Style, id: "style" },
    ]);
  });

  test("a compact window opens the inspector as a sheet", () => {
    expect.hasAssertions();

    const closedLayout = resolveLayout(emailLayout, nodeContext, SizeClass.Compact, readerState);
    const closedInspector = getRegion(closedLayout, inspectorRegionId);
    const openedState = toggleRegion(readerState, inspectorRegionId, closedInspector.isOpen);
    const openedLayout = resolveLayout(emailLayout, nodeContext, SizeClass.Compact, openedState);

    expect(closedInspector.presentation).toBe(RegionPresentation.Sheet);
    expect(closedInspector.isOpen).toBe(false);
    expect(getRegion(openedLayout, inspectorRegionId).isOpen).toBe(true);
    expect(openedLayout.canvasId).toBe(emailLayout.canvasId);
  });
});
