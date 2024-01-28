import { type AttackName } from "@/models/dungeons/attack/AttackName";
import { type BLANK_VALUE } from "@/services/dungeons/constants";

export type PlayerAttackOption = AttackName | typeof BLANK_VALUE;
