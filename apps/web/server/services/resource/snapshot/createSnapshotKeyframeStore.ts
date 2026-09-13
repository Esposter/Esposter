import type { Resource } from "@esposter/db-schema";
import type { KeyframeStore } from "keyframe-store";

import { createSnapshotObjectStore } from "@@/server/services/resource/snapshot/createSnapshotObjectStore";
import { createKeyframeStore } from "keyframe-store";

// The store over one resource's objects, as every path that writes, reads or collects a version opens it
export const createSnapshotKeyframeStore = async (resourceId: Resource["id"]): Promise<KeyframeStore> =>
  createKeyframeStore(await createSnapshotObjectStore(resourceId));
