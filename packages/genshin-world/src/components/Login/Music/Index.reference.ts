import type { ComponentReference } from "genshin-interface";

import { doorSoundTopic } from "#src/components/Login/Music/DoorSound.reference";
import { GameSourceKind } from "genshin-interface";

// The login's sounds beside its music: where the game keeps the sounds it plays, and its one topic, the door's
// Sound, with what every investigation found and what is still open. The music's own sources and fit are the music
// Page's (apps/web/content/docs/genshin/music.md)
export const reference: ComponentReference = {
  sources: {
    doorRecording: {
      capture: "yt-rBnfA4pXw6U-audio.webm",
      kind: GameSourceKind.Capture,
      name: "The English client's door, clicked",
      parityReference: "login-door-recording",
      role: "The burst the door's sounds are matched against, and the click they follow",
    },
    doorRumble: {
      block: "Minimum.pck, bank 3844515483",
      kind: GameSourceKind.Sound,
      name: "402626033",
      role: "The door's first sound, a rumble, its bands' levels read every 25 milliseconds",
    },
    doorRush: {
      block: "Minimum.pck, bank 3844515483",
      kind: GameSourceKind.Sound,
      name: "73142117",
      role: "The door's second sound, a broadband rush 75 milliseconds after the rumble, its bands' levels read the same way",
    },
  },
  topics: { doorSound: doorSoundTopic },
};
