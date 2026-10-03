// The audio the model reads: one channel at 22050 Hz, in windows of two seconds less a hop, each read a hop of 256
// Samples apart into one frame of its readings, which overlap their neighbours by thirty frames. All of it is the
// Model's own training, from Basic Pitch's `constants.py`
export const AUDIO_SAMPLE_RATE = 22050;
export const FFT_HOP = 256;
export const AUDIO_WINDOW_LENGTH_SECONDS = 2;
export const AUDIO_WINDOW_SAMPLES: number = AUDIO_SAMPLE_RATE * AUDIO_WINDOW_LENGTH_SECONDS - FFT_HOP;
export const ANNOTATIONS_FPS: number = Math.floor(AUDIO_SAMPLE_RATE / FFT_HOP);
export const ANNOTATIONS_FRAMES_PER_WINDOW: number = ANNOTATIONS_FPS * AUDIO_WINDOW_LENGTH_SECONDS;
export const OVERLAPPING_FRAMES = 30;
export const OVERLAP_SAMPLES: number = OVERLAPPING_FRAMES * FFT_HOP;
export const WINDOW_HOP_SAMPLES: number = AUDIO_WINDOW_SAMPLES - OVERLAP_SAMPLES;
// The time a window's frames run ahead of its samples, which a frame's time is pulled back by once a window, and the
// Few milliseconds Basic Pitch adds to it so a note lines up with its onset
export const WINDOW_OFFSET_SECONDS: number =
  (FFT_HOP / AUDIO_SAMPLE_RATE) * (ANNOTATIONS_FRAMES_PER_WINDOW - AUDIO_WINDOW_SAMPLES / FFT_HOP) + 0.0018;
// The model's pitches are a piano's 88 keys from A0, MIDI note 21; its contour reads three bins to a semitone
export const MIDI_OFFSET = 21;
export const ANNOTATIONS_SEMITONES = 88;
export const CONTOUR_BINS_PER_SEMITONE = 3;
export const CONTOUR_BINS: number = ANNOTATIONS_SEMITONES * CONTOUR_BINS_PER_SEMITONE;
// The model's output tensors by what each reads
export const FRAMES_TENSOR = "Identity_1";
export const ONSETS_TENSOR = "Identity_2";
export const CONTOURS_TENSOR = "Identity";
// The trained model this package ships, from wherever the package is served or installed
export const MODEL_URL: URL = new URL("../model/model.json", import.meta.url);
export const MODEL_WEIGHTS_URL: URL = new URL("group1-shard1of1.bin", MODEL_URL);
// Note creation's defaults, Basic Pitch's own, with the shortest note its website uses
export const ONSET_THRESHOLD = 0.5;
export const FRAME_THRESHOLD = 0.3;
export const MIN_NOTE_LENGTH = 11;
export const ENERGY_TOLERANCE = 11;
// How far either side of its pitch a note's bend is looked for, in contour bins, and the spread of the weighting that
// Favours the bins nearest it
export const PITCH_BEND_TOLERANCE = 25;
export const PITCH_BEND_STANDARD_DEVIATION = 5;
// A MIDI pitch bend spans two semitones either way by default, in steps of a fourteen-bit value either side of its
// Centre
export const MIDI_PITCH_BEND_SEMITONES = 2;
export const MIDI_PITCH_BEND_STEPS: number = 2 ** 13;
