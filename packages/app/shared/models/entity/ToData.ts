import type { Serializable } from "#shared/models/entity/Serializable";
import type { Except } from "type-fest";

export type ToData<T extends Serializable> = Except<T, "toJSON">;
