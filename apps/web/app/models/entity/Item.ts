import type { ANamedItemEntity } from "#shared/models/entity/ANamedItemEntity";
import type { ItemEntityType } from "@esposter/shared";
// Not a base to extend: it is the constraint a helper takes so every entity it accepts implements Item
export type Item = ANamedItemEntity & ItemEntityType<string>;
