import { ID_SEPARATOR } from "@esposter/shared";

export const toGroupKey = (father: string, part: string): string => `${father}${ID_SEPARATOR}${part}`;
