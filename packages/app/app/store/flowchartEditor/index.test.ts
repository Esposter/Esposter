// @vitest-environment nuxt
import type { GraphNode } from "#shared/models/flowchartEditor/data/GraphNode";
import type { Resource } from "@esposter/db-schema";

import { FlowchartEditor } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { GeneralNodeType } from "#shared/models/flowchartEditor/node/GeneralNodeType";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useFlowchartEditorStore } from "@/store/flowchartEditor";
import { ResourceType } from "@esposter/db-schema";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

const createNode = (): GraphNode => ({
  computedPosition: { x: 0, y: 0, z: 0 },
  data: {},
  dimensions: { height: 0, width: 0 },
  dragging: false,
  handleBounds: { source: null, target: null },
  id: crypto.randomUUID(),
  isParent: false,
  position: { x: 0, y: 0 },
  resizing: false,
  selected: false,
  type: GeneralNodeType.Rectangle,
});
const setupStore = async () => {
  const flowchartEditorStore = useFlowchartEditorStore();
  await flowchartEditorStore.loadContent();
  return flowchartEditorStore;
};

describe(useFlowchartEditorStore, () => {
  const server = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const createResource = (contentVersion = 0) =>
    createResourceListItem({ contentVersion, id: resourceId, type: ResourceType.Flowchart });
  let content: FlowchartEditor;
  let saveResourceContent: ReturnType<typeof vi.fn<() => Resource>>;

  beforeEach(() => {
    setActivePinia(createPinia());
    useRouter().currentRoute.value.params.id = resourceId;
    content = new FlowchartEditor({ nodes: [createNode()] });
    saveResourceContent = vi.fn<() => Resource>(() => createResource(1));
    server.use(
      trpcMsw.resource.readResource.query(() => ({ ...createResource(), publication: null })),
      trpcMsw.flowchart.readResourceContent.query(() => content),
      trpcMsw.flowchart.saveResourceContent.mutation(saveResourceContent),
    );
  });

  // The canvas emits `update:nodes` on every drag frame, so the blade's debounced autosave fires whether or
  // Not the graph changed — stamping the content's `updatedAt` per save turns each of those into a real write
  test("skips a save that changed nothing since the load", async () => {
    expect.hasAssertions();

    const { saveFlowchartEditor } = await setupStore();
    const isSuccessful = await saveFlowchartEditor();

    expect(isSuccessful).toBe(true);
    expect(saveResourceContent).not.toHaveBeenCalled();
  });

  test("writes an edited graph once", async () => {
    expect.hasAssertions();

    const flowchartEditorStore = await setupStore();
    const { saveFlowchartEditor } = flowchartEditorStore;
    const { flowchartEditor } = storeToRefs(flowchartEditorStore);
    flowchartEditor.value.nodes = [...flowchartEditor.value.nodes, createNode()];
    await saveFlowchartEditor();
    await saveFlowchartEditor();

    expect(flowchartEditor.value.nodes).toHaveLength(2);
    expect(saveResourceContent).toHaveBeenCalledTimes(1);
  });
});
