import type { Instrument, Music, MusicNote, MusicRecording, MusicSegment, MusicVoice } from "genshin-engine";

import { MIDI_VELOCITY_MAX, MUSIC_NOISE_BAND_CENTRES } from "genshin-engine";
import { z } from "zod";

// A recorded note an instrument layers over its synthesized one, over the keys and velocities it answers
const musicRecordingSchema = z.object({
  file: z.string().nonempty(),
  gain: z.number(),
  highKey: z.int().nonnegative(),
  highVelocity: z.int().positive().max(MIDI_VELOCITY_MAX),
  keyCenter: z.number(),
  lowKey: z.int().nonnegative(),
  lowVelocity: z.int().positive().max(MIDI_VELOCITY_MAX),
  tune: z.number(),
}) satisfies z.ZodType<MusicRecording>;
const instrumentSchema = z.object({
  attack: z.number().nonnegative(),
  decay: z.number().nonnegative(),
  harmonics: z.array(z.number().nonnegative()),
  level: z.number().nonnegative(),
  noiseBands: z.array(z.number().nonnegative()).length(MUSIC_NOISE_BAND_CENTRES.length),
  recordingLevel: z.number().nonnegative(),
  recordings: z.array(musicRecordingSchema),
  release: z.number().nonnegative(),
  sustain: z.number().nonnegative(),
  tuning: z.number(),
}) satisfies z.ZodType<Instrument>;
const musicNoteSchema = z.object({
  duration: z.number().nonnegative(),
  pitch: z.number(),
  start: z.number().nonnegative(),
  velocity: z.number().nonnegative(),
}) satisfies z.ZodType<MusicNote>;
const musicVoiceSchema = z.object({
  instrument: instrumentSchema,
  notes: z.array(musicNoteSchema),
}) satisfies z.ZodType<MusicVoice>;
const musicSegmentSchema = z.object({
  duration: z.number().positive(),
  expression: z.array(z.number()),
  voices: z.array(musicVoiceSchema),
  volume: z.number(),
}) satisfies z.ZodType<MusicSegment>;

// The login's music as `renderMusicSegment` takes it: the piece's playlist of segments, and the order its passes
// Play them in
export const loginMusicSchema = z.object({
  isLooping: z.boolean(),
  order: z.array(z.int().nonnegative()),
  segments: z.array(musicSegmentSchema),
}) satisfies z.ZodType<Music>;
