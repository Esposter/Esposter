import { CHARACTER_TERMS_FETCH_TIMEOUT_MS, CHARACTER_TERMS_PATH } from "#src/services/character/constants";
import { readCharacterPackFile } from "#src/services/character/readCharacterPackFile";
import { getResultAsync } from "@esposter/shared";

// A pack's terms are the text bundled with its model, read as written since the wording differs slightly by character,
// So the terms of each model are shown rather than a summary of them
export const readCharacterTerms = (
  characterPackBaseUrl: string,
  characterId: string,
): ReturnType<typeof getResultAsync<string>> =>
  getResultAsync(async () => {
    const response = await readCharacterPackFile(
      characterPackBaseUrl,
      characterId,
      CHARACTER_TERMS_PATH,
      CHARACTER_TERMS_FETCH_TIMEOUT_MS,
    );
    return response.text();
  });
