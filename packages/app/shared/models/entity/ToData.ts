import type { DeepOmit } from "#shared/util/types/DeepOmit";
import type { DeepOptionalUndefined } from "#shared/util/types/DeepOptionalUndefined";
import type { Serializable } from "@esposter/shared";

export type ToData<T extends Serializable> = DeepOptionalUndefined<DeepOmit<T, "toJSON">>;
