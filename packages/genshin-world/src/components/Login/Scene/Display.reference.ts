import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// How the login's scene colour reaches the screen: the bloom's programs, the uber pass's tone curve, and the post
// Profile's MHYBloom_Z settings that feed both
export const displayTopic: ReferenceTopic = {
  investigations: [
    {
      method: "The bloom shader's twelve programs read with their constant layouts",
      outcome: InvestigationOutcome.Found,
      result:
        "The prefilter subtracts a threshold from the frame and scales what is left by _MHYBloomScaler, max(0, colour - threshold) times the scaler. The threshold is _MHYBloomThreshold except where the material id buffer reads 4 or 20 to 22, which take _MHYBloomThresholdCharacter, and it is divided by the auto exposure's factor when _AutoExposureScale is above 0. The chain box-downsamples by four taps, blurs with four taps at 0.96 and 0.25 texels, and sums four levels by _MHYBloomBlurComposeWeights. The last pass either mixes toward the bloom by _MHYBloomIntensity, scales the bloom by it, or, with _MHYBloomTonemapping set, also applies the uber pass's curve",
    },
    {
      method:
        "The uber shader's variants that read _MHYBloomIntensity, diffed against the shortest variant that does not, on the standard-range path (_HDR_ON at most a half)",
      outcome: InvestigationOutcome.Found,
      result:
        "The frame is the scene plus the bloom times _MHYBloomIntensity, times the auto exposure's factor, through _WhiteBalanceMat. With _MHYBloomTonemapping set, each channel then maps to min(1, (1 - 2^(-E x) + 0.0001)^(_MHYBloomContrast + 0.01)), where E is _MHYBloomExpossure, eased toward 1 by _AutoExposureScale when the auto exposure is on. Then come the sRGB encode raised to _UserInputGamma and a dither of one 255th. The 3D table (_Lut3D, baked by the grading shader) is read only on the wide-range path, through a PQ encode, so a standard-range recording never passes through it. The uberShader source's export is Shader#88",
    },
    {
      method:
        "MHYBloom_Z.dat's 292 bytes read as 32-bit words: the object's header and name to byte 44, then the effect's active flag and its parameters as override and value pairs",
      outcome: InvestigationOutcome.Found,
      result:
        "Overridden, in field order: 0.75 at byte 60, 2.5 at 76, 0.75 at 84, the four weights 0.3, 0.3, 0.26 and 0.15 at 92 (the compose's four levels, by their shape), then a true at 244, 1.0 at 252, 0.5 at 260 and 0 at 268. A vector of 192, 85, 50 and 20 at 112 and every other field are left at their defaults. With no type data the export carries no field names, and no published source names them, so which value is the threshold, the scaler, the intensity, the exposure or the contrast is not in the data",
    },
    {
      method:
        "A scratch probe, then passes' display: each interior pixel of the exports' parts within 80 metres, the reference's colour taken back through each candidate curve and divided by the exports' albedo, and how far that light strays from the plane a sun and a sky span (computeLightPlaneResidual), on every login reference",
      outcome: InvestigationOutcome.Adopted,
      result:
        "On the current build's door at night the light lies flattest at a contrast of 0.437 (residual 1.53e-4), and three's neutral tone mapping leaves sixteen times as much (2.50e-3); the night title's minimum is sharper still at 0.45, where the neutral leaves a thousand times more. Of MHYBloom_Z's values only the 0.5 at byte 260 stands near, leaving 1.59e-4, a twenty-sixth more, where 0.75 leaves seven tenths more, so byte 260 is _MHYBloomContrast and the curve ships with it; the gap to 0.437 is what the user's gamma and the video's encoding trade with it, since both are powers too. The exposure scales every light alike, which the plane never sees, so it ships as the 1.0 at byte 252 beside the contrast and is carried by the light solved under it. The day and dawn titles and the door recording read light fifty times further off any plane at every contrast, their haze and their older builds' cameras over the exports, so they judge nothing",
    },
  ],
  openQuestions: [
    "Which of MHYBloom_Z's other values is the threshold, the scaler and the intensity: the bloom alone moves what lies around the brightest pixels, so they are measured there once the login draws the game's bloom",
  ],
};
