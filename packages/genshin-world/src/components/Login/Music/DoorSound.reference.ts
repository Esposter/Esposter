import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// The door's sound as it opens: the burst on the recording and the two sounds of the game's first package
export const doorSoundTopic: ReferenceTopic = {
  investigations: [
    {
      method:
        "The wiki's API, list=search&srnamespace=6, for login door sound, Celestia door, login sfx, door open ogg",
      outcome: InvestigationOutcome.DeadEnd,
      result:
        "No login sound is published: the wiki's file search for the login, its door and its sounds turns up only voice lines and stills",
    },
    {
      method:
        "yt-dlp's audio of yt-rBnfA4pXw6U, its frames' luminance at 60 a second and its octave bands' levels every 50 milliseconds",
      outcome: InvestigationOutcome.Found,
      result:
        "The door recording's video holds no audio, so its audio was fetched apart. Its screen first whitens at 14.633 seconds, the click; the music falls away from 14.3 and a broadband burst rises from 15.05, peaking at 15.25 with every octave band from 125 Hz to 8 kHz within a few decibels, and dies away until the recording ends at 16.5",
    },
    {
      method:
        "Every sound of Minimum.pck decoded by vgmstream, scored by the cosine of its band envelopes against the burst's over the music's level before the click at every start, then the two best fitted together at every start and gain",
      outcome: InvestigationOutcome.Found,
      result:
        "Minimum.pck, the package the game loads first, holds two banks and five streamed sounds, four of them music; one bank holds 25 sounds of its own. Matched against the burst over the music by their bands' envelopes from 1 kHz to 8 kHz, a broadband rush of 1.99 seconds scores 0.895 starting at 15.03 and a lower rumble of 1.49 seconds 0.874 at 14.95, the rest 0.81 and under. Fitted together in every octave band, both at the level they are stored at, the rumble from 14.95 and the rush a tenth of a second after, they leave 3.07 decibels of the burst's level unexplained",
    },
    {
      method:
        "Each sound's strongest spectral peaks; fitLoginDoorSound's levels rendered by computeSoundEffectSamples and fitted to the burst as the game's were",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Neither sound has a pitch: their spectra's peaks fall at no harmonic series, so each is noise whose level moves in each octave band, which our noise plays from those levels alone. Rendered so, the door's sound leaves 3.08 decibels of the burst unexplained, as the game's own two do, at the level the fit gives it, starting 0.32 seconds after the click",
    },
  ],
  openQuestions: [
    "The login's other sounds: the clicks on its buttons and the wind, each found as the door's was against a recording that plays it",
    "Whether the door's two sounds are one event of the game's: they start a tenth of a second apart in every fit, which the bank's own events would say",
  ],
};
