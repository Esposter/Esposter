import type { PaimonsBargainsRotation } from "#src/models/shop/PaimonsBargainsRotation";

import { paimonsBargainsRotationSchema } from "#src/models/shop/PaimonsBargainsRotation";
import { readGameData } from "#src/services/data/readGameData";

// Paimon's Bargains' rotation the shops dataset publishes, fetched by its key and checked against its shape as it arrives
export const readPaimonsBargainsRotation = (gameDataBaseUrl: string): Promise<PaimonsBargainsRotation> =>
  readGameData(gameDataBaseUrl, "shops/paimonsBargainsRotation", paimonsBargainsRotationSchema);
