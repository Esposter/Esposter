import type { DeepOmit } from "@/util/types/DeepOmit";
import type { DeepOptionalUndefined } from "@/util/types/DeepOptionalUndefined";

export type ToData<T> = DeepOptionalUndefined<DeepOmit<T, "toJSON">>;
