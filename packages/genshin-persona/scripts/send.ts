import { parseVoiceRequest } from "#src/services/parseVoiceRequest";
import { registerQuietExit } from "#src/services/registerQuietExit";
import { sendVoiceRequest } from "#src/services/sendVoiceRequest";

// Spawned detached by a hook, which must not wait on it, with one request as its argument: a synthesizer that is
// Not running is spawned and asked again inside the load budget, on this process's time and nobody else's. The
// Argument is checked the way the socket checks a line, since it is the same untrusted text
registerQuietExit();
const [line = ""] = process.argv.slice(2);
const request = parseVoiceRequest(line);
if (request) await sendVoiceRequest(request);
