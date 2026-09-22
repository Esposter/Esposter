import { readMissingReferences } from "#src/services/voiceMatch/readMissingReferences";
import { DEFAULT_LANGUAGE } from "@esposter/genshin-persona/src/services/constants.ts";
import { readCardedRoster } from "@esposter/genshin-persona/src/services/readCardedRoster.ts";
import { readCharacterReference } from "@esposter/genshin-persona/src/services/readCharacterReference.ts";
import { readRoster } from "@esposter/genshin-persona/src/services/readRoster.ts";

// `--check` measures nothing: it asks the wiki whether the line each character is read from — the card's, else
// The map's — is still a file in every dub, since a stem measured in one dub serves the others by the template's
// Rule, and a line renamed or never dubbed is a character the plugin would fall silent on
export const checkReferences = async (): Promise<void> => {
  const cardedRoster = await readCardedRoster(readRoster(DEFAULT_LANGUAGE));
  const stems = new Map(
    cardedRoster.map(({ character, personaCard }) => [
      character.name,
      readCharacterReference(character.name, personaCard),
    ]),
  );
  const unreferenced = [...stems].filter(([, stem]) => !stem).map(([name]) => name);
  const referenced = new Map([...stems].filter(([, stem]) => stem));
  const missing = await readMissingReferences(referenced);
  for (const line of missing) console.info(line);
  if (unreferenced.length > 0)
    console.info(`read from the longest story line, no reference: ${unreferenced.join(", ")}`);
  console.info(
    `${referenced.size} of ${stems.size} characters' references checked in every dub, ${missing.length} missing`,
  );
  process.exitCode = missing.length > 0 ? 1 : 0;
};
