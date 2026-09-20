import type { SpeechRequest } from "#src/models/SpeechRequest";
import type { StopRequest } from "#src/models/StopRequest";

// One JSON line from a hook or a verb to the resident synthesizer, which answers with one status line
export type VoiceRequest = SpeechRequest | StopRequest;
