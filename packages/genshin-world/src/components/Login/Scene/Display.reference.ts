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
    {
      method:
        "Every login reference's pixels counted where a channel stands under 24 of 255, the curve's black (its lift of 0.0001 raised to the contrast) through the sRGB encode, letterbox black left out",
      outcome: InvestigationOutcome.Found,
      result:
        "A quarter of each night frame's pixels stand under it, 25.9% of the night title's (a YouTube recording in television range) and 27.8% of the door session's (the user's own, in full range), mostly the red channel of the blue night, at 10 to 20, while the dawn title and the door recording hold none and the day's frames about a hundredth. The curve as read shows nothing that dark: a scene channel a ten-thousandth under none reaches them, which _WhiteBalanceMat can give a saturated blue before the curve, and _UserInputGamma above one darkens the encode toward them, though the contrast the display pass measured asks a gamma under one",
    },
    {
      method:
        "The login's exports searched for _WhiteBalanceMat and a colour grading effect: the scene camera's post profile and every MonoBehaviour, the shaders' strings",
      outcome: InvestigationOutcome.Found,
      result:
        "The scene camera's profile holds six effects, ElementView, FrameTransition, MHYBloom_Z, MotionBlur, ToonLightBuffer and WaterRipple, and no grading; the ten daytime gradient modulators drive _DayColor and _RimColor. Only the uber shader (Shader#88, and Shader#82 outside the login) names _WhiteBalanceMat, so a script sets it from data the exports do not hold, and the matrix is on screen only",
    },
    {
      method:
        "Each night frame's channels counted by byte under 40 (genshin:parity black's channel shares), and where its red stands under the black drawn over the frame",
      outcome: InvestigationOutcome.Found,
      result:
        "Only the red goes under: it runs down to about 8 of 255, while the green stops at 22 to 25, the curve's black, and the blue far above, the same in the television-range title and the full-range door session. A gamma or an encoding darkens every channel alike, so what takes the red under is a matrix before the curve, _WhiteBalanceMat. The red stands under the black on the towers' moonlit stone, the dais's lit faces and the high dark clouds, and not on the clear sky or the haze, so the stone's own light, albedo times light, is what the matrix takes under none. A lower envelope of the red over the green and the blue in scene colour reads the matrix's red row taking about 0.003 of the blue away in both frames (0.0025 to 0.0032 at the twentieth of the pixels lowest), as a white balance cooled to a temperature of about minus 8 in Unity's construction does; its take of the green is unsettled between them",
    },
    {
      method:
        "The tone curve drawn down to its floor, a ten-thousandth and a half under none, rather than held at none, and each hour's sky solved again with its gradient's colours free down to the floor",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The night's colour away from the moon solves its red at 22, under the black; its title scores 0.464 and its door session 0.499 as before, and every other frame within its noise. Neither frame's render shows a pixel under the black (compare's line), since the sky holds none of the reference's and the stone's light cannot go under none without the matrix after it",
    },
    {
      method:
        "_WhiteBalanceMat drawn before the curve as Unity's white balance (computeWhiteBalance), its temperature and tint refined from none where the light on the exports' parts lies flattest (genshin:parity balance), every pixel shown over none read",
      outcome: InvestigationOutcome.Found,
      result:
        "With what each light leaves off the plane read where the light lies, the refinement ran past Unity's range to a temperature of 219 and a residual of a millionth of none's: a balance near singular flattens every light by itself. Read in the pixel's own colour instead, the door session lies flattest at a temperature of minus 8.6 and a tint of 11.7, a hundredth under none's residual, and the night title at minus 10.4 and 27.2, a twelfth under; over both at once, minus 9.5 and 16. The temperature agrees between the frames and with the red's lower envelope, and the tint does not. Drawn over the night's stone light as it was solved with no balance, it takes the red under the black on 39% of the title's pixels and 42% of the door session's, against 26% and 32%, and scores 0.468 and 0.503, four thousandths worse: the light solved with no balance already stood for the balance's colour, so the stone's light is solved again under it before it ships",
    },
  ],
  openQuestions: [
    "The night's stone light solved under its white balance: calibrate takes each bin's colour back through the curve and the balance's inverse, which needs the page to hand the hour's balance to the tools beside its fog; until it is, a solve weighed as the screen shows it is led by the darkest bins it cannot reach",
    "Which of MHYBloom_Z's other values is the threshold, the scaler and the intensity: the bloom alone moves what lies around the brightest pixels, so they are measured there once the login draws the game's bloom",
  ],
};
