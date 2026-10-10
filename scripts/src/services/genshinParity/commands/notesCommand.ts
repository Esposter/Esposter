import type { SubCommandsDef } from "citty";
import type { Music, MusicNote, MusicVoice } from "genshin-engine";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { publishGameDataRecord } from "#src/services/gameData/publishGameDataRecord";
import { computeSpectrogram } from "#src/services/genshinAssets/shared/computeSpectrogram";
import { readWorldData } from "#src/services/genshinAssets/shared/readWorldData";
import { computeNoteSupport } from "#src/services/genshinParity/music/computeNoteSupport";
import { readGameMusicSegments } from "#src/services/genshinParity/music/readGameMusicSegments";
import { renderMusicOnPage } from "#src/services/genshinParity/music/renderMusicOnPage";
import {
  LISTEN_SAMPLE_RATE,
  LOGIN_MUSIC_SCREEN,
  MUSIC_PAGE_SIZE,
  NOTE_SUPPORT_FOLDS,
  NOTE_SUPPORT_FRAME_LENGTH,
  NOTE_SUPPORT_HOP_LENGTH,
  NOTE_SUPPORT_MIN_DECIBELS,
} from "#src/services/genshinParity/shared/constants";
import { openParityPage } from "#src/services/genshinParity/shared/openParityPage";
import { withFinalizerAsync } from "@esposter/shared";
import { defineCommand } from "citty";

export const notesCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Drop the notes of the login's music the game's sound does not hold: each note's fundamental in the game's sound against our render with it silenced, a sixth of the notes silenced at a time, and a note kept only where the game's stands over ours",
    name: "notes",
  },
  run: async () => {
    const music = await readWorldData<Music>("login/music.json");
    // Every note's fold, a sixth of each segment's notes by their order in time
    const noteFoldMap = new Map<MusicNote, number>();
    for (const { voices } of music.segments)
      for (const [index, note] of voices
        .flatMap(({ notes }) => notes)
        .toSorted((firstNote, secondNote) => firstNote.start - secondNote.start || firstNote.pitch - secondNote.pitch)
        .entries())
        noteFoldMap.set(note, index % NOTE_SUPPORT_FOLDS);
    // The game's sound and its spectrogram are read once for every fold, and one page renders all of them
    const games = (await readGameMusicSegments(DerivedAssetComponent.Login)).map(({ game, index }) => ({
      index,
      spectrogram: computeSpectrogram(game, LISTEN_SAMPLE_RATE, NOTE_SUPPORT_FRAME_LENGTH, NOTE_SUPPORT_HOP_LENGTH),
    }));
    const noteSupportMap = new Map<MusicNote, number>();
    const { close, page } = await openParityPage({
      height: MUSIC_PAGE_SIZE,
      screen: LOGIN_MUSIC_SCREEN,
      width: MUSIC_PAGE_SIZE,
    });
    await withFinalizerAsync(
      async () => {
        for (let fold = 0; fold < NOTE_SUPPORT_FOLDS; fold++) {
          const segmentVoicesMap = new Map<number, MusicVoice[]>(
            music.segments.map(({ voices }, index) => [
              index,
              voices.map((voice) => ({
                ...voice,
                notes: voice.notes.filter((note) => noteFoldMap.get(note) !== fold),
              })),
            ]),
          );
          for (const { index, spectrogram } of games) {
            // oxlint-disable-next-line no-await-in-loop -- the page renders one segment at a time
            const ours = await renderMusicOnPage(page, index, true, segmentVoicesMap.get(index));
            const oursSpectrogram = computeSpectrogram(
              ours,
              LISTEN_SAMPLE_RATE,
              NOTE_SUPPORT_FRAME_LENGTH,
              NOTE_SUPPORT_HOP_LENGTH,
            );
            for (const { notes } of music.segments[index]?.voices ?? [])
              for (const note of notes) {
                if (noteFoldMap.get(note) !== fold) continue;
                const support = computeNoteSupport(spectrogram, oursSpectrogram, note);
                if (support !== undefined) noteSupportMap.set(note, support);
              }
          }
        }
      },
      () => close(),
    );
    for (const [index, { voices }] of music.segments.entries())
      for (const [voiceIndex, voice] of voices.entries()) {
        const keptNotes = voice.notes.filter(
          (note) => (noteSupportMap.get(note) ?? Number.POSITIVE_INFINITY) > NOTE_SUPPORT_MIN_DECIBELS,
        );
        console.log(
          `segment ${index}, voice ${voiceIndex}: ${voice.notes.length - keptNotes.length} of ${voice.notes.length} notes unsupported`,
        );
        voice.notes = keptNotes;
      }
    console.log(await publishGameDataRecord("login/music", music));
  },
});
