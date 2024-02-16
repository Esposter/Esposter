import { type Entity } from "~/models/shared/Entity";

export type EntityValue = Entity[keyof Entity] & string;
