import { CHARACTER_TERMS_FETCH_TIMEOUT_MS } from "#src/services/character/constants";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";

// A pack's terms are the text bundled with its model, read as written since the wording differs slightly by character,
// So the terms of each model are shown rather than a summary of them. The pack is served from the app's Blob Storage
export const readCharacterTerms = (characterPackBaseUrl: string, characterId: string) =>
  getResultAsync(async () => {
    const url = `${characterPackBaseUrl}/${characterId}/terms.txt`;
    const response = await fetch(url, { signal: AbortSignal.timeout(CHARACTER_TERMS_FETCH_TIMEOUT_MS) });
    if (!response.ok)
      throw new InvalidOperationError(Operation.Read, url, `HTTP ${response.status} ${response.statusText}`);
    return response.text();
  });
