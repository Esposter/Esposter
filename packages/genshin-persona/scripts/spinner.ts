import { readPersonaCard } from "#src/services/readPersonaCard";
import { registerQuietExit } from "#src/services/registerQuietExit";
import { writeSessionSpinner } from "#src/services/writeSessionSpinner";

// Spawned detached by the session-start hook, which must not wait on it: this session's character's lines are read
// And the spinner rewritten while the person reads the card, where `setup` opted the settings in
registerQuietExit();
const [name = ""] = process.argv.slice(2);
if (name) await writeSessionSpinner(name, await readPersonaCard(name));
