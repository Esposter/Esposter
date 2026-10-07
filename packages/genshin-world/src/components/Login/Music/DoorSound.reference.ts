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
        "Each sound's strongest spectral peaks; the door sound fit's levels rendered by computeSoundEffectSamples and fitted to the burst as the game's were",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Neither sound has a pitch: their spectra's peaks fall at no harmonic series, so each is noise whose level moves in each octave band, which our noise plays from those levels alone. Rendered so, the door's sound leaves 3.08 decibels of the burst unexplained, as the game's own two do, at the level the fit gives it, starting 0.32 seconds after the click",
    },
    {
      method:
        "genshin:assets sounds over the door recording's audio from 14.633 to 16.5 seconds: every sound of Minimum.pck by its bands' levels from 1 kHz every 25 milliseconds, then every set of the best five, its starts refined, under one gain over every band",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The rush scores 0.928 from 15.025 seconds and the rumble 0.913 from 14.950, the rest 0.784 and under. The rumble alone leaves 4.19 decibels unexplained, the rumble and the rush 75 milliseconds after it 3.31, and a third sound 3.27, so the door is the pair, the rush now 75 milliseconds after the rumble rather than the tenth of a second the earlier match read at 50 millisecond frames. A gain a band instead of one over every band reads the rumble alone at 1.99, better than the pair's 3.01: it lets the rumble stand in for the rush's top octaves",
    },
    {
      method:
        "genshin:assets sounds over the door recording's audio from 11 to 13.6 seconds, where the door assembles itself before the click",
      outcome: InvestigationOutcome.DeadEnd,
      result:
        "No set settles: the best sound scores 0.871 against the burst's 0.928, and each sound added to a set still buys about half a decibel, from 7.33 decibels unexplained for one sound to 5.13 for five, with the login's own music among the matches. The music fills the window, so whether the game plays a sound as the door assembles is not separable from this recording",
    },
    {
      method:
        "The door's two sounds decoded in both channels, their channels' correlation, and our render scored against their mix in thirds of an octave every 5 milliseconds; resynthesized from their own readings at each band width, frame and channel count, and a second resynthesis against the first",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The two sounds are stereo, their channels correlated 0.46. The octave-band fit sat 8.84 decibels off them: its mono downmix read every band about three decibels over each channel's own level, and its bands stopped at 11 kilohertz where the sounds run to 20. Resynthesized from their own readings, thirds of an octave in two channels sit 2.74 to 2.83 decibels off whatever the frame, octaves 3.6 to 3.9, and two resyntheses 3.32 off each other, the noise's own grain. The onset rises over about a quarter second with no click, which 25 millisecond frames follow. Fitted as three noises a band in two channels, each band scaled once by its render read back, the door sits 3.26 decibels off on that measure, and 2.12 on genshin:parity effects with every band within about a decibel and its channels correlated 0.53",
    },
  ],
  openQuestions: [
    "The login's other sounds: the clicks on its buttons and the wind, each found as the door's was against a recording that plays it",
    "Whether the door's two sounds are one event of the game's: they start 75 milliseconds apart in the match, which the bank's own events would say",
  ],
};
