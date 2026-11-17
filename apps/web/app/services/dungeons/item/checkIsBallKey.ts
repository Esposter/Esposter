import { BallKey } from "#shared/models/dungeons/keys/image/UI/BallKey";
import { checkIsEnumValue } from "@esposter/shared";

export const checkIsBallKey = (id: unknown): id is BallKey => typeof id === "string" && checkIsEnumValue(BallKey, id);
