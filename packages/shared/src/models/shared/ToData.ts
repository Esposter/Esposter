import type { DeepOmit } from "#src/util/types/DeepOmit";
import type { DeepOptionalUndefined } from "#src/util/types/DeepOptionalUndefined";

export type ToData<T> = DeepOptionalUndefined<DeepOmit<T, "toJSON">>;
