import type { InstanceCulling } from "#src/models/culling/InstanceCulling";
import type { Node, Renderer } from "three/webgpu";

import {
  CULLING_INDEX_COUNT_INDEX,
  CULLING_INDIRECT_ARGUMENT_COUNT,
  CULLING_INSTANCE_COUNT_INDEX,
} from "#src/culling/constants";
import { createSurvivorIndices } from "#src/culling/createSurvivorIndices";
import { atomicAdd, atomicStore, float, Fn, If, instanceIndex, storage, uint } from "three/tsl";
import { IndirectStorageBufferAttribute, StorageBufferAttribute } from "three/webgpu";

interface InstanceCullingOptions {
  // The instances the pass tests, each one a compute invocation
  count: number;
  // The index count of the geometry each survivor is drawn with
  indexCount: number;
  // Whether an instance is drawn, one for yes and zero for no, read from the instance's own index
  isVisible: (instance: Node<"float">) => Node<"float">;
}

// A per-instance culling pass. Each frame it clears a count, tests every instance in a compute dispatch and appends each
// Visible one's index to a list, counting them in the indirect draw's own instance count, so the draw covers the
// Survivors and nothing more and never passes through the CPU
export const createInstanceCulling = ({ count, indexCount, isVisible }: InstanceCullingOptions): InstanceCulling => {
  const indirectArray = new Uint32Array(CULLING_INDIRECT_ARGUMENT_COUNT);
  indirectArray[CULLING_INDEX_COUNT_INDEX] = indexCount;
  const indirect = new IndirectStorageBufferAttribute(indirectArray, 1);
  // Every instance in order until a pass culls, so a draw that never runs one, as on WebGL, takes them all
  const survivorAttribute = new StorageBufferAttribute(createSurvivorIndices(count), 1);
  const counter = storage(indirect, "uint", CULLING_INDIRECT_ARGUMENT_COUNT).toAtomic();
  const survivors = storage(survivorAttribute, "uint", count);
  const resetCount = Fn(() => {
    atomicStore(counter.element(CULLING_INSTANCE_COUNT_INDEX), uint(0));
  })().compute(1);
  const cullInstances = Fn(() => {
    If(isVisible(float(instanceIndex)).greaterThan(0), () => {
      const slot = atomicAdd(counter.element(CULLING_INSTANCE_COUNT_INDEX), uint(1));
      survivors.element(slot).assign(uint(instanceIndex));
    });
  })().compute(count);
  return {
    cull: (renderer: Renderer) => {
      // oxlint-disable-next-line typescript/no-floating-promises -- cull is typed void, so the promise cannot be returned for the caller to await, and genshin-engine's package.json (packages/genshin-engine/package.json) lists no @esposter/shared dependency, only @esposter/shared-node as a dev dependency, so the engine cannot import a shared helper to wrap it
      renderer.compute(resetCount);
      // oxlint-disable-next-line typescript/no-floating-promises -- the same constraint as the line above: cull is typed void and the engine imports no shared promise helper, so the second compute is not awaited either
      renderer.compute(cullInstances);
    },
    dispose: () => {
      indirect.dispose();
      survivorAttribute.dispose();
    },
    indirect,
    // The instance a survivor's slot draws, read by the draw's own vertex stage at its instance index
    survivor: float(storage(survivorAttribute, "uint", count).toReadOnly().element(instanceIndex)),
  };
};
