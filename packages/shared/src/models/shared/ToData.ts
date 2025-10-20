import type { Serializable } from "@/models/shared/Serializable";
import type { DeepOmit } from "@/util/types/DeepOmit";
import type { DeepOptionalUndefined } from "@/util/types/DeepOptionalUndefined";

export type ToData<T extends Serializable> = DeepOptionalUndefined<DeepOmit<T, "toJSON">>;
