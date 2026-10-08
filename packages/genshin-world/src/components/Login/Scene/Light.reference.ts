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
    {
      method:
        "The walkway's pieces' submeshes read by material, their faces' area summed by material and their tops drawn into a plan by material; the surface pass given each family's emission target read as its albedo is (compareFamilyColour); the stone program's cut at _EmissionRange added to the witness's exports and to our stone (createStoneGlowNode), each family's textures read through its materials' slots, the door's frame and panel and the walkway's borders and middle lane fitted as families of their own, and the walkway's glow drawn by its materials' loops (fitLoginPaving's glows)",
      outcome: InvestigationOutcome.Adopted,
      result:
        "LoginScene_Ground01 draws no walkway: it is the towers' and the bridges' coarsest levels' material. The walkway's tops draw four materials across its width, its middle lane Ground02 (cyan, strength 1, power 2), its lanes' borders and curbs Edge01 (blue, 0.5, 3.88), its side lanes Bridge01 and its wings Bridge02, neither glowing, and Edge01 draws nearly every face that is not a top. The door's frame draws Door01 (power 3) and its panel Door02 (power 6), sharing Door01's textures, where our door fitted their mean power of 4.5. On the door session the exports' glow cut where the program cuts it moves the light pass from 15.1 to 14.7 ΔE, the light unchanged. Our glow against the exports', walkway 50.1 to 0.34 ΔE and its structure 0.838 to 0.031 against a gate of 0.027, the door 2.74 to 0.21 and 0.2082 to 0.2080, the towers 3.43 to 0.69 and 0.274 to 0.193; the bridges hold at 7.34 and 0.329, fitted from their Bridge materials alone while the exports' glow through Edge01 and Ground01. The frames score 0.4761 against 0.4893 on the door session, 0.4257 against 0.4339 on the night title, 0.4980 against 0.5030 on the phone's door frame and 0.5909 against 0.5931 on the door recording; the dawn 0.4142 against 0.4124 and the day 0.4700 against 0.4687, their lights solved under the glow before it was decoded",
    },
    {
      method:
        "Both night frames' stone samples dumped under the cut glow, then the light solved offline on the door session with each bin weighed by its pixels and by the light pass's own sensitivity, the squared columns of CIELab's change with scene colour through the white balance and the tone curve, taken at the reference's colour and taken again at ours over six rounds, each read by the light pass's measure on both frames; then the night light solved under the cut glow written (calibrate login-door-session --write)",
      outcome: InvestigationOutcome.Rejected,
      result:
        "Weighed by pixels, the light solved under the cut glow reads 14.68 ΔE on the door session against the shipped 14.69 and 13.72 on the night title against 14.09, so it ships, read back from the scene at 14.68. Weighed by the measure's sensitivity at the reference it reads 17.6 and 23.7, the dark bins taking the light, and re-weighed at ours it swings between 15.0 and 18.5 on the door session without settling. The stone 20 to 40 metres up stands 18 to 21 ΔE off under every weighing: no weighing of these bins darkens it, so the light's form lacks what darkens the game's high stone, not its solve",
    },
    {
      method:
        "The door session's frame looked at beside the reference with the walkway lit by its materials' glows, then the deferred pass's model 13 read again (Shader#25/00101) and the exported materials searched for their shader keywords",
      outcome: InvestigationOutcome.Rejected,
      result:
        "Lit so, the walkway's middle lane draws near white where the game shows grey-blue stone: Ground02's cyan at a strength of 1 by one less the facing ratio squared nearly fills at the camera's grazing look, and the game's frame holds about an eighth of the glow the materials predict on the near walkway. The deferred pass adds a model 13 pixel's glow whole, so the program as read would draw it; what decides it is the variant a material compiles, chosen by its shader keywords, which the exported materials do not hold (their files keep only the shader, the name and the saved properties), so _EnableRimGlow read as a float is no proof the glow is drawn. The surface pass graded our glow against the witness's, which draws it by the same float, and held what the frame shows wrong. The walkway's glow is taken out, its families and its paving's loops with it; the door's frame and panel, the program's cut and the textures read through their slots stay",
    },
    {
      method:
        "Every stone material exported raw beside its JSON (extract), its keywords read past its name and its shader's pointer (readMaterialKeywords), the witness drawing a rim glow only under ENABLE_RIM_GLOW_ON and fitLoginStone counting a material without it at none, then the surface and light passes at login-door-session",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Every stone material compiles ENABLE_RIM_GLOW_ON but Door02, the door's panel, which holds _EnableRimGlow at 1 and compiles no glow; Ground02 and Edge01 compile it, so the walkway's white middle lane is not a variant the material leaves out. Drawn so, the door's glow structure falls from 0.208 to 0.160 against a gate of 0.093, its colour 0.37 ΔE within its gate, and the light pass from 14.68 to 14.64 ΔE",
    },
    {
      method:
        "The light pass's distance by height with the haze's opacity scaled to a half and to none, then the light darkened with height as a factor e^(-k h) over the walkway held through solveStoneLight, k from 0.03 to 0.2 a metre and stopping at 10 to 40 metres or never, solved on the door session and read on both night frames, then written (calibrate --darkening 0.14 --write) and read back",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The haze is 0.08 opaque 5 metres up and none from 20, and less of it leaves every band further off, so the pale towers over the walkway are the light's. Darkened at 0.14 a metre up to 20 metres the light reads 13.49 ΔE on the door session against 14.68 and 12.89 on the night title, never solved on, against 13.72, the stone 20 to 40 metres up 12.9 against 20.6; read back from the scene, 13.50. The crowns past 40 metres, 80 pixels, stand darker than the game's (27.5 against 23.6), and past 20 metres the darkening holds, which darkened on stood them darker still. The door session's frame scores 0.4791 against 0.4836 and the night title 0.4230 against 0.4297, the rest level. Every other hour keeps none until a frame of its hour solves its own",
    },
    {
      method:
        "The door session's frame beside the reference under the darkened light, the haze's density read along a ray below the walkway, and calibrate --haze over both night frames under the new light",
      outcome: InvestigationOutcome.Found,
      result:
        "The near towers' mean colour now stands 2.6 ΔE from the game's, yet the far towers stay pale: their bodies stand below the walkway, where the night's haze holds about 10 a metre 5 metres down and hides any stone within a metre, while the game shows them dark down to its cloud sea. Both measures weigh by pixels and read those towers on a few dozen, 63 and 67 pixels in the two lowest bands, so the haze solve keeps its wall (residual 0.0974 against 0.0983 under the shipped): the wall stands for the cloud billows under the near walkway, and a haze measure weighing the far stone by its depth is the tool owed before the haze is solved again",
    },
    {
      method:
        "The stone program's per-material and per-camera buffers named from its own serialized layouts (parseShaderConstantLayouts over Shader#171's raw export), the login's scripts read for a property block (genshin:assets behaviours login, MonoBlockController and MonoLoginScene's fields), its clips searched for a material curve, and the walkway's middle lane read along its length in the door session's reference",
      outcome: InvestigationOutcome.DeadEnd,
      result:
        "The G-buffer variant reads _RGColor at cb2[5], _RGPower and _RGStrength at cb2[6].xy and _EmissionRange at cb2[9].x, and the view from _WorldSpaceCameraPos at cb1[5], each as the witness reads it, and its rim takes the normal-mapped normal; the lighting pass adds a model 13 pixel's glow whole. The MonoBlockController the dump names, on one bridge piece, holds every field zero, and every other piece's component, named by its object, two small integers and no material or float; MonoLoginScene holds transforms, effects and timings and no material, and the login's clips animate its interface and the lift alone, so nothing found sets the walkway's glow at run time. The game's middle lane is pale grey-blue, from 56, 160, 236 near to 68, 172, 237 far in the frame's sRGB, brightening only a little toward the grazing end, between our lane without the glow (saturated blue) and with it (near white)",
    },
    {
      method:
        "The haze's residual weighed by depth rather than by pixels, every octave of the stone's distance from the eye counting alike (computeHazeResidual given a weight a bin, held through its solve and its residual), then calibrate --haze over both night frames under it and again by pixels",
      outcome: InvestigationOutcome.Rejected,
      result:
        "Weighed by depth the haze solves to density 2.4e7, falloff 1.48 and opacity up to all, residual 0.1164 against 0.1171 under the scene's own; by pixels to 2.4e7, 1.43 and all, 0.0974 against 0.0983. Both keep the wall: the far towers' octaves weighed up do not release it, so what holds it is the haze's one exponential form, which cannot draw the bright billows under the near walkway and leave the far stone dark below them. The wall stands for the cloud sea, and the measure moved nothing, so it was not kept",
    },
    {
      method:
        "The night light solved on the door session (calibrate login-door-session, unwritten) with the witness drawing no rim glow on Ground02 and Edge01, as the shipped walkway draws none, against the same solve under the witness as it stands",
      outcome: InvestigationOutcome.Found,
      result:
        "Without the walkway's glow the solve leaves 0.1739 against 0.1751 with it, over the same 34,482 pixels, and the light stays blue alone, its harmonics' red under a hundredth either way: the glow is not what keeps red and green out of the night light. The game's middle lane carries red and green the light cannot, so a share of Ground02's glow stands in the frame, between none (our saturated blue lane) and all (the witness's near white one)",
    },
    {
      method:
        "Ground02's normal map as the stone program decodes it against the witness's: the material's saved _FillNormalGaps, the exported texture's channels, and the witness's texture load and tangent frame (loadWitness, three's NormalMapNode)",
      outcome: InvestigationOutcome.DeadEnd,
      result:
        "Both decode the texel as its three channels by two less one, unswizzled and unscaled, and Ground02 saves _FillNormalGaps at 0, so neither flattens a normal. The map is nearly flat, its blue 0.995 on average and never under 0.87, its red and green centred on a half, so its tilts lean every way alike about the face's normal. The one difference is the frame: the game turns the texel by each vertex's tangent, the witness by the screen's derivatives, its meshes read from OBJ without tangents. A frame turns each texel's lean, not the lane's mean facing, so it cannot take most of the rim away",
    },
    {
      method:
        "passes login's surface measure on login-door-session with its glow terms moved out, then the glow read by the light pass against the reference's frame (measureGlow): each family's glow pixels, the frame there against our stand-in lit under the same camera, the structure gated at the frame's two pixels",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The surface pass holds its unlit colour and structure alone, and stops red on its three structure terms (the bridges 0.0491 against 0.0331, the towers 0.1012 against 0.0257, the walkway 0.0826 against 0.0172). Its four glow pairs compared our emission target with the exports', which the frame does not show, so the light pass reads them against the frame instead; that read has not run, since `passes --pass Light` waits on the surface's gate",
    },
    {
      method:
        "The dusk sun set to the shadow solve's direction (genshin:parity shadows on login-door-recording, the grid's start at f2422d7309) against the one it replaced, then compare login-door-recording at each, and passes --pass Light read on the door session",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The solved direction [0.493, 0.763, 0.418] lies 35.7 degrees from the old one and casts the recording's tower shadows 5.28 px from its edges. The recording's frame falls from 17.22% to 16.88% mean difference (shape 0.356 to 0.368, tone 12.14% to 11.90%, FLIP 0.5942 to 0.5878). The door session's shadow edges stay at 143.28 px: that session is the night, lit by the moon, which no solve sets, so the moon's shadows wait on a shadow solve over the door session",
    },
    {
      method:
        "calibrate login-door-session --witness login without --write, the solve set beside the night light written, then passes --pass Light's stone colour read on the result",
      outcome: InvestigationOutcome.Found,
      result:
        "The re-solve reproduces the written night light to four decimals in its ramp, harmonics and haze colours, residual 0.1751 against the bins' spread 0.3372, so the light's colour, intensity and ambient already sit at their least-squares floor and the stone colour holds at 13.50 ΔE against 2.30. What stays is the form's: the bins at 20 to 40 metres (12.9 to 27.5 ΔE) and the bulk from 0 to 20 metres (3.2 to 15.7 ΔE) hold no colour, intensity or ambient term that moves them, so nothing was written",
    },
    {
      method:
        "passes --pass Light's glow terms with the door's and the towers' rim strength at none, an eighth, a quarter, a half and the materials' whole, each family's glow colour read by ΔE and its structure against the frame",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The door's glow colour is 25.46 ΔE at the whole strength, 21.76 at a half, 19.86 at an eighth and 19.68 at none, its structure 0.377, 0.376, 0.324 and 0.325. The towers' is 7.03 at the whole, 1.77 at a quarter, 1.42 at an eighth and 1.43 at none, structure 0.559, 0.491, 0.474 and 0.473: a glow whose peak stays under the stone's 0.1 range draws no pixel, so below an eighth the towers' colour reads flat. The eighth is taken for both families as the frame's share, shipped as `GLOW_SCALES` in `fitLoginStone` (door 1.1 to 0.14, towers 0.73 to 0.09), which holds the towers' colour at 1.43 ΔE, inside its gate. The door's colour floor of 19.7 ΔE is its albedo under the glow pixels, the surface pass's, not the glow's. Night session: mean difference 13.26% to 12.69%, FLIP 0.4792 to 0.4657; door recording: 16.88% to 16.84%, FLIP 0.5878 to 0.5886",
    },
    {
      method:
        "The walkway's and the bridges' glow terms read at their fitted strength, which holds none, against the frame's glow colour (passes --pass Light)",
      outcome: InvestigationOutcome.Found,
      result:
        "Both families draw no glow, so no scale reaches them: the walkway's colour stands at 41.01 ΔE and the bridges' at 15.21 ΔE. The walkway's glow was taken out for its near-white middle lane; restoring it at an eighth, as the door and the towers take theirs, was measured with the paving's glow loops drawn into its material and rejected, in the two entries below",
    },
    {
      method:
        "passes --pass Light's walkway glow terms with the paving's loops drawn into the walkway's material: the middle lane's over its tops and the edges' over the tops they cover and every face that is not a top, at none (the baseline), the edges alone at a quarter, then the lane at an eighth and at a quarter with the edges at a quarter, each read by ΔE and its structure against the frame",
      outcome: InvestigationOutcome.Rejected,
      result:
        "With none the walkway reads 41.01 ΔE and structure 0.428. The edges alone at a quarter read 40.97 and 0.429, their rim drawing no pixel at that share. The lane at an eighth reads 26.78 and 0.594, at a quarter 20.13 and 0.612, so the lane's glow lowers the colour and raises the structure at each step. Both scales at a quarter (walkwayLane 0.25, walkwayEdge 0.25) leave the colour at 20.13 ΔE against its gate of 2.30 and the structure at 0.612 against 0.125, both still failing, and the approved login-screen images (LoginScreen, -dawn, -day, -dusk) change with it, which only the user approves, so it was reverted. One scale per family cannot hold: a lit rim brightens toward its grazing end, while the game's middle lane stays a pale grey-blue, so the lane's colour and structure pull apart at every share. What is left to try is a glow that falls off toward the grazing angle",
    },
    {
      method:
        "passes --pass Light's bridges glow term with the bridges' rim drawn over every piece from the mean of Edge01's and Ground01's rims, at a half of its strength, an eighth and none, each read by ΔE and its structure against the frame",
      outcome: InvestigationOutcome.Rejected,
      result:
        "The bridges' colour reads 15.27 ΔE at a half and 15.21 at none, its structure 0.394 against 0.387. At an eighth the rim stays under the stone's glow range and draws no pixel, so it reads 15.21 as none does. No fraction improved the bridges' glow, so the bridges draw none",
    },
    {
      method:
        "The door session's stone colour on the shipped night light (passes login --pass Light), its bins split by family, by how the face lies to the sun, by height and by haze, and each bin's lightness apart from its hue and chroma",
      outcome: InvestigationOutcome.Found,
      result:
        "The 14.26 ΔE over 33,745 pixels in 244 bins is the towers' 81% (28,853 pixels, 13.44 ΔE), the walkway's 12% (2,302, 25.37) and the door's 7% (2,590, 13.49); the bridges have no interior pixel in this frame. Lightness is 53% of the squared error, hue and chroma 47%. The towers and the door are too bright (ΔL +7.5 and +8.6) and too green (Δa −5.5 and −8.5), the walkway too dark (ΔL −7.3) and too red and blue (Δa +16.1, Δb −6.7). Sunlit faces (ramp coordinate 0.75 and over) carry 55% of the error at ΔL +6.1, grazing faces 26% at +6.3, and turned-away faces 18% at +8.8, with Δa −7.6, Δb +3.7 and chroma 34.5 against 40.1: the shaded stone is too bright and short of red, not too dark or too blue. The samples keep no shadow of their own, which enters only through the ramp coordinate, so a shadowed face cannot be told from a grazing one. By height, ours less the reference's lightness is +1.4 below the ground (matching), +5.7 from 0 to 5 metres (11,270 pixels, 16.3 ΔE), +9.6 from 5 to 10, +12.0 from 10 to 20 (the reference 16, ours 28) and +5.3 from 20 to 40. Clear stone, under a tenth of haze, is +8.3 and 16.3 ΔE; stone under half a haze and more is +1.3 and 7.8. Our render under the same light reads 0.5, so the gap is the light's form, not the renderer",
    },
    {
      method:
        "The night light's height darkening scanned from none to 0.4 on the same bins with the other terms held, the darkening at 0.18 solved again by calibrate --darkening 0.18 --write, and the ambient's scale and a red offset scanned at 0.14 and 0.18",
      outcome: InvestigationOutcome.Rejected,
      result:
        "The darkening alone is best at 0.18 (13.96 ΔE), moving the 10 to 20 metre stone from +12.0 to +9.3 and leaving 0 to 5 metres at +5.3 at every rate scanned; the ambient's best, its scale at one and a red offset of 0.02 at 0.18, reads 13.68. Solved again at 0.18, calibrate hands back a light reading 14.39 (its linear residual 0.1991 under the spread 0.3528, the shipped light's 0.2004): the least squares falls while the ΔE rises, since it weighs its bins in linear light and the measure in CIELab. The shipped light with only its darkening set to 0.18 reads 13.96, but its approved night frame's Bridges glow colour moves from 12.19 to 12.27, a figure worse on an approved image, so it is not landed. The parameters the scene already has explain under 0.6 ΔE of the 14.26",
    },
  ],
  openQuestions: [
    "Why the game shows the walkway's middle lane with a fraction of Ground02's glow though every input the program reads matches the witness's: a G-buffer variant the dump does not hold, the normal map's decode being the same; the witness still draws it whole, so the light is solved under a glow the frame does not show",
    "The bridges' and the towers' glow by material: the bridges' glow reads 7.3 ΔE off, our bridges fitted from their Bridge materials alone where the exports' glow through Edge01 and Ground01, and the towers' structure 0.19 against 0.08, their Build materials' glows averaged into one",
    "The night's crowns past 40 metres, darker than the game's under the darkening that holds past 20 metres, and the form the darkening stands in for: the reflection pass's clustered probes or a haze form the scene lacks",
    "The night's far towers below the walkway, hidden in the haze's wall where the game shows them dark: the wall stands for the cloud sea's billows under the near walkway, which no weighing of the haze's one exponential form releases, so the cloud layer drawing the billows comes first and the haze is solved again after it",
    "What tells the day's and the dusk's stone haze from their light: calibrate --haze settles neither, and the stone's albedo varies too little to split a haze that adds from a light that scales",
    "The night's moon against the door session's shadows: the dusk sun is set to its shadow solve on the door recording, but the door session is the night, whose moon no solve sets, and its shadow edges read 143.28 px; a shadow solve over the door session is the measure owed, its grid run as a queue item",
    "What the day's and the dusk's falling ramps stand in for: not the sun's direction, and holding them to rise scores the dusk worse, so the highlight, the reflection and the normal maps the solve lacks first",
    "The reflection pass's light probes and cube, set at run time, which the unclamped ramp's lower half stands in for on turned-away faces until they are modelled; the highlight, a dielectric's, waits behind them, and its stone smoothness is to be fitted without _GlossMapScale",
    "How the deferred pass lights shading model 13, the rim glow's pixels, and what the post pass's haze adds after it",
    "The night's stone, lighter than the game's from 0 to 40 metres (+5.7 at 0 to 5, +9.6 at 5 to 10, +12.0 at 10 to 20) and short of red on its turned-away faces (Δa −7.6), where the light's darkening, ambient scale and red offset explain under 0.6 ΔE of 14.26: the ground stone matches, while the first five metres above it stay +3.4 at the strongest darkening scanned, so a step at the ground is a term the light lacks. The candidate is the shadow the walkway casts on the stone beneath its deck, which the moon's direction still sets wrong (shadow edges 23.49 px against 2); the shadow solve over the door session comes first, then the stone light is solved again on the measure's own ΔE",
  ],
};
