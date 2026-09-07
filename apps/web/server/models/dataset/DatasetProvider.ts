import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetReference } from "#shared/models/dataset/DatasetReference";
import type { AuthedContext } from "@@/server/models/auth/AuthedContext";

export type DatasetProvider = (ctx: AuthedContext, reference: DatasetReference) => Promise<Dataset>;
