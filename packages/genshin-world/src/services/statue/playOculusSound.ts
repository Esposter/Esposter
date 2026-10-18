import { VolumeSetting } from "#src/models/menu/VolumeSetting";
import { getStoredChannelGain } from "#src/services/menu/getStoredChannelGain";

// Provisional: the game's own Oculus sound is not in the game data this recreation reads, so a short chime is synthesised
// Until the owed minimap recording gives the game's sound, which then replaces it
let audioContext: AudioContext | undefined;

export const playOculusSound = (): void => {
  audioContext ??= new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const now = audioContext.currentTime;
  oscillator.type = "sine";
  oscillator.frequency.value = 1320;
  gain.gain.setValueAtTime(0.2 * getStoredChannelGain(VolumeSetting.Sfx), now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.4);
};
