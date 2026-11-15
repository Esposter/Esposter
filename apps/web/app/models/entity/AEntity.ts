import type { AItemEntity } from "#shared/models/entity/AItemEntity";
import type { ItemCompositeKeyEntity } from "@esposter/db-schema";

export type AEntity = AItemEntity | ItemCompositeKeyEntity;
