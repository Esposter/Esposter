import { neutralizeFormula } from "#src/services/resource/sheet/commands/neutralizeFormula";

export const sanitizeTsvField = (value: string) => neutralizeFormula(value).replaceAll(/[\t\r\n]/gu, " ");
