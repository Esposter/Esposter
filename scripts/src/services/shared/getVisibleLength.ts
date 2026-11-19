import { ANSI_ESCAPE_REGEX } from "#src/services/shared/constants";

export const getVisibleLength = (text: string): number => text.replaceAll(ANSI_ESCAPE_REGEX, "").length;
