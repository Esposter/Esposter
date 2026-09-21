import { findCharacterByName } from "#src/services/findCharacterByName";
import { readInterfaceLanguage } from "#src/services/readInterfaceLanguage";
import { readPersonaCard } from "#src/services/readPersonaCard";
import { readRoster } from "#src/services/readRoster";
import { registerQuietExit } from "#src/services/registerQuietExit";
import { writeSessionSpinner } from "#src/services/writeSessionSpinner";

// Spawned detached by the session-start hook, which must not wait on it: this session's character's lines are read
// And the spinner rewritten while the person reads the card, where `setup` opted the settings in. The character
// Arrives as the English name, which is the identity, and the roster it is looked up in is the interface
// Language's — so the label written is the name that language spells them by
registerQuietExit();
const [name = ""] = process.argv.slice(2);
const language = readInterfaceLanguage();
const character = name ? findCharacterByName(readRoster(language), name) : undefined;
if (character) await writeSessionSpinner(character, await readPersonaCard(character.name), language);
