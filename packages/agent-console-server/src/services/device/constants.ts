// Where the host keeps what it must remember between runs — its paired devices and its key — readable by the person
// Alone, in their home directory
export const STATE_DIRECTORY_NAME = ".agent-console-server";
export const DEVICES_FILENAME = "devices.json";
export const HOST_KEY_FILENAME = "host-key.pem";
export const SECRET_BYTE_LENGTH = 32;
// How long the code on a link the host prints pairs a page: long enough to open the link, short enough that a link
// Left in a scrollback or a history pairs nothing
export const PRINTED_PAIRING_CODE_DURATION: number = Temporal.Duration.from({ minutes: 10 }).total("milliseconds");
