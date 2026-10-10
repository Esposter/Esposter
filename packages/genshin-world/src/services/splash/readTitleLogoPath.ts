import type { TitleLogo } from "#src/models/splash/TitleLogo";

import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The path of one title logo, fetched by its key from the hosted game data as the login's fit publishes it
// Checked against its schema as it arrives
export const readTitleLogoPath = (gameDataBaseUrl: string, logo: TitleLogo): Promise<string> =>
  readGameData(gameDataBaseUrl, `splash/titleLogo/${logo}`, z.string());
