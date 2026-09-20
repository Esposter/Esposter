// One arrangement of the engine over the machine's devices: a name the status line and the verb report, and a
// Device per component as the runtime keys them
export interface VoiceDeviceRung {
  devices: Record<string, string>;
  name: string;
}
