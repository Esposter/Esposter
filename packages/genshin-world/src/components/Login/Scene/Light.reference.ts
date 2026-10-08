import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// How the login is lit: the stone's and the deferred pass's shaders, the light and haze solved by hour, and occlusion
export const lightTopic: ReferenceTopic = {
  investigations: [
    {
      method:
        "The witness's normal target checksummed with and without the part's normal node, calibrate --self on the night, then calibrate --write on every hour and compare on every login frame",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The witness's normal target wrote each mesh's own normal, the material's normal node never reaching a basic material's normal, so it is taken from the view into the world from the part's own node: the night's --self read-back moves from 0.061 to 0.056 off over a light of 0.50, its residual 0.013, so the model draws what the renderer draws and the rest is what the bins leave the ramp and the harmonics to trade. Every hour re-solved under it fits its bins closer (the dusk's 0.141 against 0.157) and scores the day level, the door recording 0.5361 against 0.5369 and the phone's door frame 0.4791 against 0.4811, the dawn 0.4414 against 0.4382 and the night level: the day's and the dusk's lights ship, the dawn's and the night's stay",
    },
    {
      method:
        "The scene's sky read at six points against computeSkyWeights at the applied state, then compare login-door-recording with the god rays lit, and with the pass left out of createPostPipeline",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The login sets the god rays' colour to black, and the pass mixes the frame toward its colour by the lit air along each ray, so it darkens the sky toward the sun by about a quarter where the solve's own model matches the scene's sky at the frame's middle, and every part behind lit air with it. Drawn in the sun's colour the frame washes pale (FLIP 0.647); with the pass out of the chain the frame stands brighter and scores 0.641 against 0.619 at the same sky, every hour's light having been measured under the darkening",
    },
    {
      method:
        "genshin:assets material values for every LoginScene_ material, then genshin:parity light and haze login-door-recording with and without the light's shadow, and compare at every hour",
      outcome: InvestigationOutcome.Found,
      result:
        "Every login stone material holds _ReceiveShadow 0, yet the references show the towers' shadows across the walkway, so the game shadows its stone otherwise. Drawn without the sun's shadow, the door frame's near faces solve to a sun near three times stronger and a sky light five times weaker (genshin:parity light, converged in four steps), but the door, day and night stills all score worse without the shadow, and with it back that light scores worse than the scene's; the sun's direction is not settled by the faces' shading either, every heading and elevation fitting the recording's near faces within a hundredth of the best",
    },
    {
      method:
        "genshin:parity exposure, light and fog on login-dawn-title, login-day-title and login-night-title, then compare at each step and at the day haze's densities",
      outcome: InvestigationOutcome.Adopted,
      result:
        "On the title frames: the exposure scaled dawn and day down a quarter and night up threefold, scoring every hour better (night 0.492 to 0.460); a second step at night, nearer the median, scored worse. The day's haze from 0.04 to 0.195 moves its frame and the phone's door frame by under 0.01 either way, so the washed day is our towers' flat light, not the haze; the light's solve runs away on every hour (a sun 7700 times as blue at dawn), its lit and shaded faces read off stand-ins whose faces are not the game's",
    },
    {
      method:
        "A Levenberg–Marquardt solve of the sun's share and the sky light's per-channel share on rendered frames at every hour, applied and compared with and without the witness",
      outcome: InvestigationOutcome.Rejected,
      result:
        "Drawing each guess as the frame draws, haze, clouds and tone mapping with it, over the exports, and matching the medians of the faces facing up, toward the sun and from it, the sun's strength and the sky light's colour converge in a few steps (the cost falling to between a half and a fifth) and never run away, yet scored the dusk, the day, the night and the wiki's door frame worse with our parts and with the exports, the night by 0.02; only the dawn's witness frame improved, by 0.005. Freed to colour the sky light from above and below apart, the dawn's sun doubled and its ground light turned deep blue, scoring its witness frame worse. The faces' medians pay for the haze's colour and depth, so the light waits on the haze, and the solver was deleted",
    },
    {
      method:
        "AnimeStudio's log over the stone's block, then its export with every type filter suffix it offers, then the stone's programs decompiled",
      outcome: InvestigationOutcome.Found,
      result:
        "AnimeStudio's parser refuses the stone's shader (miHoYo/Scene/Login Base) and the cloud layer's, and drops what it refuses from a raw export as well; the type filter Shader:Export writes them unparsed, and every one of the block's shaders reads like any other. The stone's programs only write the G-buffer: its normal from the normal map (a normal shorter than _FillNormalGaps flattened), its albedo as _Color by the diffuse texture less 0.96 of it by the mask's metal, its specular colour as 0.04 graded to the albedo by that metal with the mask's smoothness beside it, and the emission graded into _RGColor at _RGStrength by one less the facing ratio raised to _RGPower; where that glow reaches _EmissionRange the pixel is written as shading model 13, its glow in place of its specular colour. _SpecColor, _Shininess and _GlossMapScale are not read",
    },
    {
      method:
        "Every shader of every block in the asset index exported unparsed and named by its own string; the deferred shading shader's programs disassembled and decompiled, its sun pass read",
      outcome: InvestigationOutcome.Found,
      result:
        "The deferred passes are Hidden/Internal-DeferredShading and Hidden/DeferredReflections in 00/00612967.blk, named by every block's shaders exported unparsed. The sun's pass lights a pixel as its diffuse colour by the sun's colour through a ramp (_DeferredToonRampTex) read at a half plus half the facing to the sun by the shadow raised to a fifth, plus the sky's spherical harmonics on the normal by the diffuse colour graded toward white by the occlusion, plus a GGX highlight of roughness squared smoothness, capped at 12, by a Schlick term with no visibility term; the diffuse colour itself grades toward the reflection cube by smoothness on upward faces. The environment is lit on a ramp after all, in the deferred pass rather than the material, which the light solve's model lacks. The ramp is in no asset of the index, so it is set at run time",
    },
    {
      method:
        "compare --witness login on login-door, login-door-recording and login-dawn-title, the witness with and without the rim",
      outcome: InvestigationOutcome.Found,
      result:
        "The witness drawn with the stone's rim glow as its program grades it scores the frames level or a little worse (the phone's door frame 0.466 to 0.468, the recording's door frame 0.606 to 0.612, the dawn level): the glow's pixels are shading model 13, which the deferred pass lights apart, and the witness lights it as any other. The rim stays, being the program's; the witness's light is the deferred pass's to replace",
    },
    {
      method:
        "The fog's density and colours solved with each light's share, ours drawn under the sun alone and the sky alone, the bins split by how their faces turn to the sun, on login-door-recording, then compare there and on the dusk still",
      outcome: InvestigationOutcome.Rejected,
      result:
        "Solving the dusk's light and haze together on the door recording gives a sun 2.5 times as strong, a sky light a third as strong and a haze dense, dark away from the sun and bright toward it, which scores the recording 0.03 better and the dusk still 0.05 worse; drawn, both frames turn to a flat orange wall with the towers' silhouettes, where the references keep their towers lit and edged, so the bins' medians by depth, angle and facing still reward a haze that washes our towers to the frame's mean, our towers lacking the lit structure the references' carry",
    },
    {
      method:
        "A scratch solve of both light models over the dawn's and the door recording's witness pixels, per pixel and binned, under the scene's haze",
      outcome: InvestigationOutcome.Found,
      result:
        "Over the parts' interior pixels the witness draws from the exports, the reference in scene colour against the exports' albedo, normal and depth: binned by depth, facing and how far a face turns up, the old sun and ambient leave 0.130 of the dawn's 0.164 spread and 0.192 of the door recording's 0.274, the deferred pass's ramp and sky harmonics 0.075 and 0.091. Pixel by pixel neither explains much (0.24 of 0.30 at dawn), so the exports' texels do not line up with the reference's and a light is read over bins",
    },
    {
      method: "genshin:parity calibrate login-night-title --self, after each fix",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Solved against the exports as our own scene drew them under a light already written, the solve handed back a sky light 1.4 to 2 times too strong: the haze's blend weighs its own colour by one less its scatter, which the solve had not; the rim and glow the material adds after lighting had gone into the sky term; and the grade and bloom after the tone mapping bent every colour off what toSceneColor inverts. With each fixed, and the login drawn through the tone mapping alone, the read-back returns the light to within about a ninth, the rest the normal maps the G-buffer leaves out",
    },
    {
      method:
        "genshin:parity calibrate on each hour's frame with --write, the haze's solved colours applied and reverted hour by hour, then compare on every login frame",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The haze's colours solved with the light over the stone scored the dawn 0.4938 to 0.5087 and the night 0.4523 to 0.4575, helping only the dusk (0.5682 to 0.5656): the haze's colour is the cloud sea's too, and over the stone alone it took up the light's errors. The light is solved under the scene's haze held as it is. Every hour's light so solved, with the day's and the night's skies, scores the dawn 0.4950, the day 0.4447, the night 0.4498, the door recording 0.5698 and the phone's door frame 0.4782, against 0.4943, 0.4874, 0.4492, 0.5767 and 0.4529 before",
    },
    {
      method:
        "genshin:parity calibrate on the day title and the door recording with the ramp held to rise and the sun's direction refined, the haze's glow turned with it, held, and solved alone, then compare on every login frame",
      outcome: InvestigationOutcome.Rejected,
      result:
        "Held to rise, solved as non-negative rises by an active set, the ramp leaves the dawn, the day, the night and the phone's door frame level and scores the door recording 0.5824 against 0.5698. Refined by Nelder–Mead from the hand-set directions, every one judged over the bins the scene's own direction sorts the pixels into, the day's sun moved about five degrees for 0.00005 of a 0.106 residual and the dusk's about one and a half for a hundredth of it: the sky's linear harmonics take up the ramp's facing term, so the faces cannot read the direction. With the haze's sunward glow turned with the light, the dusk's sank below the horizon for a sixth of its residual; the glow solved alone, the light held, points behind the camera, its glow over the stone wanted gone where the cloud sea's is measured. The glow turned toward the dusk's sun rather than its light, the light re-solved, scored the door recording 0.5821 against 0.5824. All reverted",
    },
    {
      method:
        "The deferred block's shaders listed by their properties (_TOON_ON names Shader#25, _ProbeClusterCubeDefault Shader#13), the sun's program found by its highlight's cap, and both read",
      outcome: InvestigationOutcome.Found,
      result:
        "The sun's program is Shader#25's program 101 in the deferred block's export (login/shaders/00612967). It reads the shading model from the G-buffer's last target, smoothness from another, the specular colour from a third and the normal, albedo and occlusion, and lights a pixel as its albedo by the light's colour through a one-channel ramp at a half plus half its facing clamped at none, by the shadow raised to a fifth, plus the sky's harmonics (the second order's nine, floored at none) by the albedo graded toward white by the occlusion, plus min(12, D/π) by Schlick's F by the light's colour, the clamped facing and the shadow: D is GGX at a roughness of one less the smoothness, squared, and F grades the specular colour toward white by one less the light's dot with the half vector to the fifth, by twice one less the roughness squared. Shading model 13 takes 0.04 for its specular colour, the albedo's alpha for its smoothness, and adds the specular target's colour by twenty times the smoothness target squared as glow. The stone program writes 0.04 graded to the albedo by its mask's metal as the specular colour, so the stone's highlight is a dielectric's, about a tenth of the lit stone's colour at its peak; the fitted stone's smoothness is scaled by _GlossMapScale and its specular colour is _SpecColor, neither of which the program reads. The reflection pass (Shader#13) adds the light probes' clustered ambient and the reflection cube, both set at run time",
    },
    {
      method:
        "genshin:parity calibrate on every hour with the facing clamped, --write, then compare on every login frame, rank on the dawn title and calibrate --self",
      outcome: InvestigationOutcome.Rejected,
      result:
        "The ramp's facing clamped at none as the pass clamps it, the ramp held from its shadowed middle, every hour re-solved: the binned residual reads lower (dawn 0.067 against 0.085), but only because every turned-away pixel falls into one ramp bin and the bins' spread falls with it; the frames score the dawn 0.5149 against 0.4950, the night 0.4676 against 0.4498, the door recording 0.5761 against 0.5698, the day and the phone's door frame level. Under rank the dawn's middle towers turned away lose most (0.116 to 0.129): the unclamped ramp's lower half shapes turned-away faces by their facing, a curve the sky's second order harmonics cannot draw, standing in for light the model lacks, the reflection pass's probes first. --self leaves 0.012 of residual, so the model draws what the renderer draws. Reverted",
    },
    {
      method:
        "A scratch table of each frame's linear luminance and ours, by depth band and the world height the witness's depth gives, over the walls (a normal within 0.3 of level) at every hour",
      outcome: InvestigationOutcome.Found,
      result:
        "By depth and world height over the walls alone, the recordings' stone is bright below the walkway and dark above it at every hour, where ours stands level: at 20 to 40 metres out the dawn's 0.63 against our 0.40 under the walkway and 0.22 against 0.36 over it, the night's 0.35 against 0.19 and 0.04 against 0.17, the dusk's 0.43 against 0.32 and 0.16 against 0.31. The haze's falloff was set by hand and the fog solve binned by depth and angle alone, so the light solved over bins spanning heights stood too dark below and too bright above",
    },
    {
      method:
        "genshin:parity calibrate --haze on every hour's frame, each profile set in LoginSkyStateMap and its light written, then compare --all; the day's light re-solved alone under its old haze",
      outcome: InvestigationOutcome.Adopted,
      result:
        "calibrate's bins split by height, the haze's density and falloff refined by the simplex with the light, its colours held: the dawn solves to a density of 1.60 at the cloud sea's top falling 0.254 a metre (residual 0.120 against 0.160 under the scene's), the night to 3.40 and 0.297 (0.146 against 0.196), the dusk to 0.26 and 0.167 (0.152 against 0.168), the day to 0.081 and 0.079 from either start (0.169 against 0.171). Each written with its light, the dawn scores 0.3890 against 0.4382, the night 0.4003 against 0.4452 and the door recording 0.5255 against 0.5361; the day's scored its title 0.4402 and the phone's door frame 0.4867 against 0.4397 and 0.4791, and its light alone re-solved under its old haze 0.4418 and 0.4819, so the day keeps both. The dense haze drowns the cloud sea into one pale sheet where the recordings show its billows",
    },
    {
      method:
        "The cloud sea's material writing no depth, so the haze pass leaves it, then compare on the dawn and the night",
      outcome: InvestigationOutcome.Rejected,
      result:
        "The cloud sea drawn clear of the dense haze, its billows unpaled, scored the dawn 0.4360 against 0.3890 and the night 0.4378 against 0.4003: the haze's pale sheet stands nearer the recordings than our billows, so where the game's sea stands, not whether the haze covers it, is the unknown. Reverted",
    },
    {
      method:
        "rank on the dawn title, the night title and the door recording, its height bands by depth (readLightCeilings)",
      outcome: InvestigationOutcome.Found,
      result:
        "Each height band's linear luminance over the parts, the recording's against the exports' as our scene draws them, by depth: beyond 80 metres ours stands too bright at every height and every hour, by a fifth at dawn, a quarter at dusk and up to two and a half times at night, and further off the deeper the stone lies, so the haze hides too much of the far stone; over the walkway, from 20 metres out, ours stands about an eighth too bright at every depth, a light that dims with height; under the walkway at 20 to 80 metres the two agree",
    },
    {
      method:
        "A scratch term in solveStoneLight, its falloff refined with the haze by calibrate --haze on the dawn title",
      outcome: InvestigationOutcome.Rejected,
      result:
        "A light from the cloud sea, each pixel's albedo by a colour fading exponentially with its height over the sea, solved with the light and the haze over the dawn's bins: residual 0.1114 against 0.1203, with its falloff at 0.06 a metre, but only by emptying the haze to a density of 0.028, the light standing in for it, so the cloud sea's pale sheet, which the frames need, would go. Not built",
    },
    {
      method:
        "maxOpacity on FogUniforms and SceneFog, refined by calibrate --haze on every hour's frame, each profile set in LoginSkyStateMap and its light written by calibrate --write under it, then compare on each hour's frames, compare --witness on the dawn by layer, and compare --all",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The haze held under a most opacity, refined with its density and falloff: the dawn solves to 0.67 (residual 0.1102 against 0.1203) and scores 0.3935 against 0.3888, its towers 0.1767 against 0.1756 and its sky 0.1448 against 0.1402 by layer, its cloud sea paling less; the night solves to 0.65, a density of 12.6 falling 0.46 a metre (0.1127 against 0.1455), and scores 0.3756 against 0.4003; the dusk to 0.77, 0.37 falling 0.21 (0.1480 against 0.1517), and scores 0.5197 against 0.5246; the day to 0.74, 5.46 falling 0.25 (0.1555 against 0.1708), and scores its title 0.4342 against 0.4396 but the phone's door frame 0.5026 against 0.4789. The night's and the dusk's ship with their lights; the dawn and the day keep theirs",
    },
    {
      method: "A scratch term in solveStoneLight at fixed falloffs, the haze held, by calibrate on the night title",
      outcome: InvestigationOutcome.Found,
      result:
        "Under the night's shipped haze held, a light by the albedo fading with height over the cloud sea leaves a residual of 0.1058 at a falloff of 0.02 a metre, 0.1064 at 0.05, 0.1099 at 0.1 and 0.1124 at 0.4, against 0.1127 without it: what is left with height is a gentle gradient over tens of metres, as clustered probes stepping up the towers would cast it, not a glow off the sea near its top",
    },
    {
      method:
        "A scratch term in solveStoneLight at falloffs of 0.02, 0.05 and 0.1, the haze held, by calibrate on the dawn title and the door recording; then heightFade on StoneLight, written by calibrate --write at every hour and compared on each hour's frames and compare --all",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The same light at the dawn leaves a residual of 0.1172 at 0.02 a metre, 0.1171 at 0.05 and 0.1174 at 0.1 against 0.1203, and at the dusk 0.1451, 0.1447 and 0.1465 against 0.1480, so every hour reads best near 0.05. Built into the stone's light at that falloff (STONE_HEIGHT_FALLOFF), solved per hour with the ramp and the harmonics and written, it scores the dawn 0.3856 against 0.3889, the day's title 0.4369 against 0.4396 and the phone's door frame 0.4721 against 0.4788, the door recording 0.5165 against 0.5197 and the night 0.3674 against 0.3756. Its colour differs by hour, the dawn's and the day's near grey, the night's blue with its red below none and the dusk's red with its blue below none, so it carries more than the probes' light",
    },
    {
      method:
        "Scratch terms in solveStoneLight with the bins split by sideways distance, by calibrate on the dawn and the day titles",
      outcome: InvestigationOutcome.Rejected,
      result:
        "A light varying across the scene, the albedo by its sideways and its forward distance from the eye, solved with the light over bins split sideways as well: the dawn's residual 0.1292 to 0.1279 and the day's 0.1786 to 0.1753, a hundredth to two. Not built",
    },
    {
      method:
        "An active set over solveStoneLight's knots, fade and harmonics at 64 directions, by calibrate --write and compare on the night and the dawn",
      outcome: InvestigationOutcome.Rejected,
      result:
        "The night's ramp runs under none in blue across its middle knots and its harmonics swing to minus two to four on the normals the camera never sees, so the night's far towers draw orange-brown. Held at none or above, every knot, the fade and the sky's light on 64 directions over the sphere, the night scores 0.3805 against 0.3674 and the dawn 0.3977 against 0.3856: the negative light is cancelling a haze too bright over the far stone, so it stays",
    },
    {
      method:
        "GTAONode in createPostPipeline at 4, 8 and 16 metres with compare on every frame, then createOcclusionNode with the witness's occlusion target, calibrate --write at every hour and compare at 8 and 4 metres, then the phone's frame at the medium tier",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Screen-space occlusion over the frame's depth, without the light solved under it, scores the night 0.3605 to 0.3609 at 4, 8 and 16 metres against 0.3674, the dawn and the door recording within a thousandth either way, and the day's title and the phone's door frame worse. Solved under it through the witness's occlusion target at 8 metres, the night scores 0.3649, the door recording 0.5141 against 0.5165, the day's title 0.4373 against 0.4369 and the dawn 0.3864 against 0.3856; at 4 metres the dawn 0.3877 and the day 0.4383. The phone's door frame drawn with none, under the day's light solved with it, scores 0.4667, and at a phone's tier 0.4685, against 0.4721. The day, the dusk and the night ship it at 8 metres and the phone's frame draws none; the dawn draws none",
    },
    {
      method:
        "calibrate --haze on the day title, the haze set in LoginSkyStateMap, calibrate --write, then compare on both day frames",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The day's haze solved again under its occlusion, with the phone's door frame at a phone's tier: a density of 0.204 falling 0.125 a metre with no most opacity (residual 0.1677 against 0.1712). Written with its light, the day's title scores 0.4305 against 0.4373 and the phone's door frame 0.4698 against 0.4685, so it ships",
    },
    {
      method:
        "stoneLight.json read hour by hour, the night's fading red clamped and compared, then calibrate --write at every hour by non-negative least squares with the parts weighed equally and by their pixels, calibrate --haze under it, and compare on every login frame",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The night's towers turned colour as they rose, red at their tops to blue at their feet: its light solved free faded red below none with height (-0.38) under a sky redder than its frame, and the day's whole ramp stood below none, each light cancelling another where the frames' FLIP scored the sum better. Solved by non-negative least squares over lights that can be (the ramp rising from none by steps none of which falls, the sky a sum of lights from 32 directions round the sphere, each lighting no face below none, the fading light none or more), every tower holds one colour up its height, the dawn scores 0.3849 level, the day 0.4346 against 0.4305, the phone's door frame 0.4732 against 0.4688, the dusk 0.5191 against 0.5143 and the night 0.3737 against 0.3650. Clamping only the night's fading red after the free solve scored 0.3798 and pinker, the other lights solved to cancel it; each part's bins weighed as much as every other part's lit the far towers bright blue, the night 0.4251; the haze re-solved under the held light ran to its bounds (the night a wall of 0.29 opacity, the dawn none), so the far stone's haze is the next measure",
    },
    {
      method:
        "hazeColor and hazeScatterColor as unknowns in solveStoneLight, then the stone mask on StoneNodeMaterial and the stone light handed to createPostPipeline, calibrate --write at every hour, calibrate --self on the night title and compare on every login frame",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The haze over the stone solved as two non-negative colours with the light, away from the sun and toward it, lowers every hour's residual by about a twentieth (dawn 0.1332 to 0.1274, day 0.2242 to 0.2131, dusk 0.1490 to 0.1434, night 0.1332 to 0.1289). Against the cloud sea's, the day's comes out dimmer and bluer with no sunward glow, the dusk's warmer and redder, the dawn's sunward glow dimmer and the night's close; the dusk's light fading with height falls to almost none, its haze taking what it held. Drawn through a stone mask the scene pass writes, every frame scores better: the dawn title 0.3849 to 0.3805, the day title 0.4346 to 0.4321, the phone's door frame 0.4732 to 0.4667, the door recording 0.5191 to 0.5126 and the night title 0.3737 to 0.3654, and calibrate --self on the night hands the haze back within about a twentieth",
    },
    {
      method:
        "rank login-day-title --witness login, its height bands by depth read against its light map (the exports' light over the reference's, smooth over a few pixels)",
      outcome: InvestigationOutcome.Found,
      result:
        "By day the stone 20 metres up and 40 to 80 out reads 0.442 in the exports against the recording's 0.198, while every other cell stands within a fifth and beyond 80 metres the ratio holds near 0.8 at every height, so no haze profile explains it. The light map finds that cell on the lantern tower's crown and on the two wide towers top left, which stand where the recording shows sky and one thin ringed tower: the day's towers stand apart from the recording's, which the arrangement's day placement left open, and their stone lit over the recording's sky reads as stone too bright",
    },
    {
      method:
        "The engine's neutral tone mapping replaced by the game's curve (Display.reference.ts), calibrate --write on every hour's frame, then compare on every login frame against the neutral curve at the same tree; the bins' means first taken back pixel by pixel, then as the screen shows them weighed by the curve's slope, then as the screen shows them weighed by their pixels",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Taken back pixel by pixel, the curve's steep top stood a near-white pixel for a scene colour many times its neighbours', each bin's mean followed its brightest pixels and the night's walkway came out pure blue: the night scored 0.484 against the neutral curve's 0.369. Weighed by the curve's slope, the darkest bins led instead, the curve rising thirty times as steeply at black, and the night's light left more than its bins spread. Taken back once from the bins' displayed means and weighed by their pixels, which ships, the night scores 0.462, the dawn 0.449 against 0.402, the day 0.505 against 0.464 and the door recording 0.584 against 0.541, while the phone's door frame comes nearer, 0.479 against 0.510: the sky, the clouds and the haze were all solved under the neutral curve, which the light alone cannot answer",
    },
    {
      method: "calibrate --haze on every hour's frame under the game's tone curve, its sky solved again under it",
      outcome: InvestigationOutcome.Rejected,
      result:
        "Every hour's haze runs off its bracket: the night's density to 3093 at a most opacity of one, the dawn's to 1868, the dusk's to 64 at 0.41, each only a few hundredths under its scene's own haze's residual, and the day's light leaves 0.504 of its bins' 0.580 spread. Taken back once from each bin's displayed mean, the residual is in scene colour, which the curve's steep top stretches near white, while a quarter of each night frame's pixels stand under the darkest the curve shows (Display.reference.ts), so neither weighing reads the haze; it waits on what draws the game's black",
    },
    {
      method:
        "calibrate --haze on the night under its white balance, its residual broken down by how bright each bin shows, then the haze refined on each hour's frames under the light left free in each part's bin of ramp coordinate and how far a face turns up, read as the display encodes it, with the stone under the walkway cut and not, and jointly over the night's two frames; the night's and the dawn's set in LoginSkyStateMap, calibrate --write under them, and compare on their frames",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Under the balance the night's haze still ran off its bracket (density 8831 at an opacity of one, its red light none), with four fifths of the scene-colour residual in bins shown brighter than 0.6. Under a light free per part every hour's haze came out a step: the dawn's hiding all the stone under about 6 metres below the walkway, the night's 2 to 3 and the day's about 2.5, where the cloud sea's billows stand (LoginCloudBandMap's bottom band, its clouds' middles up to 2.4 under), and the step held its place with the stone under the walkway cut. Above the walkway no haze is left: its best is a near-black fog over the far stone, which stands darker against its albedo the further off it lies, as rank's height bands by depth show at every height, and no profile settles from different starts. Solved jointly over the night's frames the step converged from three starts (density 3.4e5, falloff 1.155, most opacity 0.986), its residual 0.109 against 0.120 under the scene's haze and 0.176 under none, and the dawn's alone likewise (818, 0.836, all); the day's starts landed apart and the dusk's two shapes scored within four ten-thousandths, so both stay. Set with their lights solved under them, the night title scores 0.4479 against 0.4630, the door session 0.4752 against 0.4974 and the dawn 0.4143 against 0.4270, our red under the black on 39% and 42% of the night's pixels against the game's 26% and 32%",
    },
    {
      method:
        "The night's stone on the door session and the night title sorted into eight bands of how bright the reference shows its green, the light solved free with each band's mean shown colour, height, haze, normal and ramp coordinate read beside the game's, then the day title and the door recording the same way",
      outcome: InvestigationOutcome.Found,
      result:
        "On the door session the game's darkest stone is its high stone, 13 to 16 metres up with no haze, and its brightest the low stone 2 to 6 metres under the walkway inside the haze's step, while the ramp coordinate barely moves between bands (0.27 to 0.48), so the night's dark and bright are height and haze, not the moon's side and the shade. By day our stone reads flat across the bands (red 0.46 to 0.56) where the game's runs 0.07 to 0.80, the light leaving 0.51 of the bins' 0.58 spread: bands of the reference's own brightness pick out the pixels its texels darken, and ours, a pixel off, regress to the frame's mean, so banded by the reference no light reads apart from the noise its pixels hold. The balance's bands by the green (Display.reference.ts) read the same way",
    },
    {
      method:
        "The light pass's measure (passes --pass Light, measureLight): each bin a solve reads, its mean colour as the reference shows it against the shipped light's cast through the white balance and the tone curve, in CIELab, weighed by its pixels (readStoneColourDistance), gated at 2.3 or at what the same light reads against our own render of the exports under it",
      outcome: InvestigationOutcome.Adopted,
      result:
        "On the door session the shipped night light, solved on the night title, reads 23.4 ΔE, by height 9 to 28, and our own render under it 0.9, so the light's model holds what the render draws to under a ΔE and the pass is gated at 2.3. The bins hold one part's faces at one depth, height, ramp coordinate and tilt, which a pixel's misalignment does not move between",
    },
    {
      method:
        "The stone program's G-buffer variant (Shader#171) and the deferred pass's shading model 13 read for the glow, then each material's colours decoded from sRGB in toMaterialValues, the witness laid out again (genshin:assets witness login) and the stone fitted again (fit login --only stone)",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The program writes the glow (the emission graded into _RGColor at _RGStrength by the rim) normalized by its brightest channel past one, that channel as sqrt(0.05 x) in the fifth target, and the pass adds the normalized colour by twenty times that squared, so the screen shows the glow as the program builds it wherever its length reaches _EmissionRange (0.1 on every stone) and none under. Unity saves a colour as the sRGB its inspector shows, which a project lit in linear space decodes before a shader reads it, and the materials' colours were read as saved: the walkway's _RGColor of 0.70, 0.96 and 1 is 0.45, 0.92 and 1 in linear light, and the night's near walkway's glow red fell from 0.12 to 0.08, still eight times the 0.009 the game's frame shows there in scene colour. The towers' and the door's rims fit bluer (0.06, 0.25, 0.88 for 0.27, 0.54, 0.95). Under the night light solved before, the door session scores 0.4985 against 0.4752 and the night title 0.4411 against 0.4479, the light having stood for the undecoded glow",
    },
    {
      method:
        "Scratch terms in solveStoneLight over the night's two frames and every other hour's: the glow's colour solved per channel as a scale of the material's, faster height falloffs (0.15, 0.05 with 0.2, and 0.5 a metre), and the bins weighed by the tone curve's slope to the half and the whole, each read by bands of the reference's green",
      outcome: InvestigationOutcome.Rejected,
      result:
        "Solved free, the glow's red and green go to none at night (0.00 to 0.01) and its blue to a fifth to two thirds, but by day and at dusk its red to 2.4 to 7.6 with its blue none: it takes each frame's hue onto its grazing faces rather than reading a glow, and moves the bands' mean distance by under a ΔE. No falloff or weighing lowers the bands' mean distance on both night frames, and a falloff of 0.5 a metre runs to e^20 forty metres under the walkway. Not built",
    },
    {
      method:
        "The night's light solved on the current build's door session under the decoded glow (calibrate --write), read by the light pass's measure, and offline on both night frames beside the light solved on the night title and on both at once",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Solved on the door session the light reads 15.1 ΔE there against the shipped 23.4, and on the night title, which it was not solved on, 13.9 against the shipped 19.1 and the title's own solve's 14.7; solved on both at once it reads 16.5 and 14.8. The light's red is none in every term and its green within a hundredth or two of none, the night's stone lit in blue alone. The high stone still stands furthest off, 19 to 23 ΔE 10 to 40 metres up, the game's shown colour halving about every 5 metres up where ours barely darkens: the solve weighs its bins in scene colour, where that stone's error is small, so the light solved on the measure's own ΔE is next. Every other hour's light was solved under the undecoded glow and waits on a current build's frame at its hour. With the decoded rims, the night title scores 0.4339 against 0.4479 and the door session 0.4893 against 0.4752, its mean and tone nearer and its FLIP further: the light lends the near walkway no green, the exports' ground glow (LoginScene_Ground01 and 02, cyan at a strength of 0.3 and 1) supplying it, and our walkway fits its rim from LoginScene_Bridge01 alone, at a strength of none, so it draws the walkway a saturated blue",
    },
  ],
  openQuestions: [
    "The walkway's ground glow: the exports' ground materials glow cyan along the near walkway, which the night's light now leaves to them, while our walkway's rim is fitted from Bridge01 alone at a strength of none; the stand-ins' glow against the exports' is measured by no pass yet",
    "The night's high stone, 10 to 40 metres up, still 19 to 23 ΔE off: the light solved on the light pass's own ΔE rather than in scene colour",
    "What tells the day's and the dusk's stone haze from their light: calibrate --haze settles neither, and the stone's albedo varies too little to split a haze that adds from a light that scales",
    "The dusk sun's direction against its shadows: a tower's shadow falls over the wings in front of the door where the recording's are lit, and the faces' shading cannot settle the direction, the light's binned residual flat round the hand-set one, so the shadows' own edges are the measure left",
    "What the day's and the dusk's falling ramps stand in for: not the sun's direction, and holding them to rise scores the dusk worse, so the highlight, the reflection and the normal maps the solve lacks first",
    "The reflection pass's light probes and cube, set at run time, which the unclamped ramp's lower half stands in for on turned-away faces until they are modelled; the highlight, a dielectric's, waits behind them, and its stone smoothness is to be fitted without _GlossMapScale",
    "How the deferred pass lights shading model 13, the rim glow's pixels, and what the post pass's haze adds after it",
  ],
};
