import { MONSTER_PARTY_MAX_LENGTH } from "#shared/services/dungeons/constants";

export const ROW_SIZE = 3;
// The party screen lays the whole party out, so its grid is as many columns as the party's size takes at ROW_SIZE
export const COLUMN_SIZE: number = MONSTER_PARTY_MAX_LENGTH / ROW_SIZE;

export const DEFAULT_INFO_DIALOG_MESSAGE = "Select a monster.";
export const INFO_CONTAINER_HEIGHT = 65;
