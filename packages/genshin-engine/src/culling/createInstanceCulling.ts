import type { InstanceCulling } from "#src/models/culling/InstanceCulling";
import type { Node, WebGPURenderer } from "three/webgpu";

import {
  CULLING_INDEX_COUNT_INDEX,
  CULLING_INDIRECT_ARGUMENT_COUNT,
  CULLING_INSTANCE_COUNT_INDEX,
} from "#src/culling/constants";
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
// visible one's index to a list, counting them in the indirect draw's own instance count, so the draw covers the
// survivors and nothing more and never passes through the CPU
export const createInstanceCulling = ({ count, indexCount, isVisible }: InstanceCullingOptions): InstanceCulling => {
  const indirectArray = new Uint32Array(CULLING_INDIRECT_ARGUMENT_COUNT);
  indirectArray[CULLING_INDEX_COUNT_INDEX] = indexCount;
  const indirect = new IndirectStorageBufferAttribute(indirectArray, 1);
  const survivorAttribute = new StorageBufferAttribute(count, 1, Uint32Array);
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
    indirect,
    // The instance a survivor's slot draws, read by the draw's own vertex stage at its instance index
    survivor: float(storage(survivorAttribute, "uint", count).toReadOnly().element(instanceIndex)),
    cull: (renderer: WebGPURenderer) => {
      renderer.compute(resetCount);
      renderer.compute(cullInstances);
    },
  };
};
