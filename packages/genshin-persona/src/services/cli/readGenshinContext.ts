import type { GenshinContext } from "#src/models/GenshinContext";

import { SESSION_ID_ENVIRONMENT_VARIABLE } from "#src/services/constants";
import { readInterfaceLanguage } from "#src/services/readInterfaceLanguage";
import { readLocalization } from "#src/services/readLocalization";
import { readRoster } from "#src/services/readRoster";

export const readGenshinContext = async (): Promise<GenshinContext> => {
  const language = readInterfaceLanguage();
  const { locale, strings } = await readLocalization(language);
  return {
    language,
    listFormat: new Intl.ListFormat(locale, { type: "disjunction" }),
    roster: readRoster(language),
    sessionId: process.env[SESSION_ID_ENVIRONMENT_VARIABLE] ?? "",
    strings,
    today: Temporal.Now.plainDateISO(),
  };
};
