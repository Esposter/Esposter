import { readMissingReferences } from "#src/services/voiceMatch/readMissingReferences";
import { DEFAULT_LANGUAGE } from "genshin-persona/src/services/constants.ts";
import { getCharacterReference } from "genshin-persona/src/services/getCharacterReference.ts";
import { readCardedRoster } from "genshin-persona/src/services/readCardedRoster.ts";
import { readRoster } from "genshin-persona/src/services/readRoster.ts";

// `--check` measures nothing: it asks the wiki whether the line each character is read from — the card's, else
// The map's — is still a file in every dub, since a stem measured in one dub serves the others by the template's
// Rule, and a line renamed or never dubbed is a character the plugin would fall silent on
export const checkReferences = async (): Promise<void> => {
  const cardedRoster = await readCardedRoster(readRoster(DEFAULT_LANGUAGE));
  const characterNameStemMap = new Map(
    cardedRoster.map(({ character, personaCard }) => [
      character.name,
      getCharacterReference(character.name, personaCard),
    ]),
  );
  const unreferenced = [...characterNameStemMap].filter(([, stem]) => !stem).map(([name]) => name);
  const referencedCharacterNameStemMap = new Map([...characterNameStemMap].filter(([, stem]) => stem));
  const missing = await readMissingReferences(referencedCharacterNameStemMap);
  for (const line of missing) console.info(line);
  if (unreferenced.length > 0)
    console.info(`read from the longest story line, no reference: ${unreferenced.join(", ")}`);
  console.info(
    `${referencedCharacterNameStemMap.size} of ${characterNameStemMap.size} characters' references checked in every dub, ${missing.length} missing`,
  );
  process.exitCode = missing.length > 0 ? 1 : 0;
};
