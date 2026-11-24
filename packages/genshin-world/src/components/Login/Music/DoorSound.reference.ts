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
    {
      method:
        "readGameMixVolumes over the sounds playing the door's two sources, and the nodes and buses above them in the banks as wwiser dumps them: each node's volume, filters and effects up to the master bus",
      outcome: InvestigationOutcome.Found,
      result:
        "The game does not play the two at the level they are stored at. Through its sound and the mixers above it the rumble plays 16 decibels over its source and the rush 9, so the rumble stands 7 decibels further over the rush than the fit lays them, and both pass a shared mixer's low-pass of 20 and high-pass of 15 on Wwise's scale, then the effects bus's compressor (threshold -9 decibels, ratio 4, no attack, release 0.15 seconds), then the master's 5 decibels down and its peak limiter (threshold -2 decibels, ratio 50). The login's first piece plays 5 decibels under its source through the same master, so before the compressor the game's door stands 16 decibels over that piece where ours, at its sources' level beside the music's mix volume, stands 5 over. Not applied: the filters' cutoffs on Wwise's scale sit behind Audiokinetic's documentation's captcha, and the compressor's detector is not published, while the door recording's music matches neither of the login's pieces at any offset, so the door cannot be read out from under it to measure either",
    },
    {
      method:
        "readGameSoundEffect laying each matched sound at the volume readGameMixVolumes reads for its source, every bus up to the master's, then the door fitted again (fit login --only sounds) and scored (genshin:parity effects), and the login's player sending the door through a compressor at the effects bus's settings and a limiter at the master's",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The rumble now plays 16 decibels over its source and the rush 9, the door 11 decibels nearer the music's level than at the sources'. Fitted so, the door reads 2.18 decibels off the game's sounds at their mix volumes, its channels correlated 0.58 against 0.53, every band's bias within about a decibel, as at the sources' level. The player's compressor holds the effects bus's -9 decibels, 4 to 1, no attack and 0.15 seconds' release, its threshold 5 decibels lower since the data carries the master's 5 down; the master's limiter holds -2 decibels at 20 to 1, the most a browser's compressor takes, against the game's 50. Neither dynamic is scored, since the recording's music hides the door",
    },
    {
      method:
        "A one-off analysis of the English recording's audio, not committed: its band under 150 hertz as a root-mean-square every 50 milliseconds against the music's own level (7.5 to 10.5 seconds and 14.0 to 15.0), the thirds of an octave of 11.6 to 13.2 seconds against 8.0 to 10.5, and a spectrogram from 8 to 16 seconds read by eye",
      outcome: InvestigationOutcome.Found,
      result:
        "The game plays a low layer while the door forms. The music's band under 150 hertz sits at -40.4 decibels, and the layer's own level in that band is -32 decibels from 11.0 seconds, -27 to -30 from 12.0 to 13.5, and it is gone by 13.9. Its excess lies in 30 to 100 hertz, 15 to 26 decibels over the pre-door spectrum at 40 to 80 hertz and little above 250 hertz, while the 150 to 600 hertz band holds its baseline to 12.5 seconds. The layer starts 0.6 seconds before the first piece shows at 11.6, and the click's rumble and rush reach -28 decibels in the same band. A sustained line near 100 hertz is present from 10.6 seconds. The 13.0 to 13.5 second swell lifts the whole spectrum by about 4 decibels, so the layer's level there is an upper bound",
    },
    {
      method:
        "genshin:assets sounds over the English recording's audio from 11.0 to 13.6 seconds and from 11.6 to 13.2, every sound of Minimum.pck by its octave bands from 63 hertz up. A lowest band of 31 hertz and one of 60 hertz selected the same bands then, since the matcher's bands began at the music's 63 hertz",
      outcome: InvestigationOutcome.DeadEnd,
      result:
        "No game sound matches the layer. The best single sound scores 0.79 from 11.9 seconds, a 2.85-second sound (0.775 over 11.0 to 13.6), and the best set of five leaves 5.9 decibels unexplained, where the door's own pair leaves 3.07 under the full-band match; the click's rumble scores 0.55 there",
    },
    {
      method:
        "The matcher's octave bands widened to start at 31.5 hertz, one bin of a frame below the music's 63 hertz band, and tested on pure tones: a 40, 50 or 60 hertz tone puts 35.5, 10.5 and 1.2 percent of its power in the 31.5 hertz band and the rest in the 63 hertz band",
      outcome: InvestigationOutcome.Found,
      result:
        "The 31.5 hertz band reads a frame's first bin alone, so it takes the energy below about 30 hertz. The layer's excess lies in 30 to 100 hertz, mostly 40 to 80: the 63 hertz band held most of it, but a 40 hertz part puts 35.5 percent of its power in the 31.5 hertz band, which the pre-widening matcher never read, so the widening changes what the matcher reads of the layer and the earlier matcher saw only part of it. The 63 hertz searches above and the 31.5 hertz bank search below both find no sound",
    },
    {
      method:
        "genshin:assets sounds over the English recording's audio from 11.0 to 13.6 seconds and from 11.6 to 13.2, with the octave bands from 31.5 hertz up, over every sound of Banks0 to Banks31: 69,170 unique sounds, each decoded by vgmstream r2168, the macOS build of the release that loads against the FFmpeg Homebrew now ships, and scored by the repo's own matching functions over a bounded pool",
      outcome: InvestigationOutcome.DeadEnd,
      result:
        "No bank sound matches the layer, and none clears the door pair's 0.91 and 3 decibels. Over 11.0 to 13.6 seconds the best single sound scores 0.798 (379943834, from 11.200 seconds), and the best set of four leaves 6.96 decibels unexplained. Over 11.6 to 13.2 seconds the best scores 0.788 (583669560, from 11.925 seconds), and the best set of four leaves 4.95 decibels. The same top sounds came out of re-scoring only the 63-hertz searches' candidates, so the candidate rule missed none of the top",
    },
    {
      method:
        "The forming's low layer built from the readings above: the 63 hertz octave band of the engine's own noise at the band's level, under an attack of 1.0 second, a hold of 1.5 and a release of 0.4, started by the scene when the door's copy is a lead's glide from its rise",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The band covers 44.5 to 89 hertz, which holds the layer's excess at 40 to 80 hertz (15 to 26 decibels over the pre-door spectrum); the parts from 30 to 44 and from 89 to 100 hertz are left out. The envelope gives 2.9 seconds from the layer's 11.0-second onset to its fall by 13.9, and the level is the band's -27 decibels, which the layer holds at -27 to -30 from 12.0 to 13.5 seconds. The layer ships in no record, its levels being its envelope's own, so no publish is owed. The lead is 750 milliseconds before the rise, the onset at 11.0 seconds against the first piece's rise at 11.75. The glide holds its pace from the door being due until it rises, so the lead holds whenever the glide has that long to fly after the due; the walkway's copies are 16 metres, so a due within the lead of the rise starts the layer with the due. The layer's match is not measured here: the search above is its reference",
    },
  ],
  openQuestions: [
    "The shared mixer's low-pass of 20 and high-pass of 15 on Wwise's scale, whose cutoffs sit behind Audiokinetic's documentation's captcha, and the compressor's detector, unpublished, so the browser's own stands in: each measured from a recording whose music is the login's own, or from the cutoff table",
    "The login's other sounds: the clicks on its buttons and the wind, each found as the door's was against a recording that plays it",
    "Whether the door's two sounds are one event of the game's: they start 75 milliseconds apart in the match, which the bank's own events would say",
    "The layer under the door's forming is built as a measured layer under the sound-effects spec, since no bank sound matches it over 11.0 to 13.6 seconds (the best scores 0.798 where the door clears 0.91, and the tail to 13.9 is unsearched): a sound that matched it would replace the built layer, and the music and streamed packages of the next question are where one could be",
    "The music and streamed packages, Music0 to Music31 and Streamed0 to Streamed31, are unsearched: 15.9 GB compressed, with 20,823 sounds that no bank or Minimum.pck holds across the packages the search pattern named. Many of those sounds run for minutes, and each decodes whole to a WAV of about 20 megabytes on average, so a full search would write several hundred gigabytes; a run over 917 of them was stopped before its results were written. A layer that lives in one of those tracks would be missed until a decode that stops after the window searches them",
  ],
};
