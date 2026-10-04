// One arrangement of the engine over the machine's devices: a name the welcome and the verb report, and a
// Device per component as the runtime keys them
export interface VoiceDeviceRung {
  devices: Record<string, string>;
  name: string;
}
