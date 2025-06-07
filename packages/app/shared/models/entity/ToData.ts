import type { Serializable } from "#shared/models/entity/Serializable";
import type { DeepOmit } from "#shared/util/types/DeepOmit";
import type { DeepOptionalUndefined } from "#shared/util/types/DeepOptionalUndefined";

export type ToData<T extends Serializable> = DeepOptionalUndefined<DeepOmit<T, "getObjectKeys" | "toJSON">>;
