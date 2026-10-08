import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// The login's sky: its colours solved by hour, the clouds' cover, heights and colours, and the cloud sea
export const skyTopic: ReferenceTopic = {
  investigations: [
    {
      method:
        "genshin:parity clouds, sky and cover over login-door-recording, the cloud mask checked by eye on its sheet",
      outcome: InvestigationOutcome.Found,
      result:
        "The mask read nine tenths of the door recording's sky as cloud, its clear lavender sky with it: the clear surface settles under the sky's wisps and its glow toward the sun, which then pass the fixed ratio. Split by Otsu's threshold over that surface the mask is the eye's, about two fifths cloud; the sky solved on its clear pixels scores the recording's FLIP a hundredth better and reads salmon for lavender; cover re-solved on it reads worse than the shipped shares by its own measure, each guess moving the threshold",
    },
    {
      method:
        "genshin:parity sky login-door-recording with solveNonNegativeSystem, its drawn line read at each state, then compare",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The salmon dusk was the solve's: it clamped a negative colour to none after a free least squares, leaving the terms that colour cancelled too red (residual 0.21 in scene colour). Solved with none negative over every clear pixel, the shape refined on the pixels within their spread, the residual is 0.039 and the sky lavender away from the sun (#78597f) and rose toward it (#c57a78), its halo a pale gold. The scene's own sky drawn with no cloud stands 0.133 off the recording's clear sky, from 0.143, its mean #98666f against #a86d7b, the right hue and darker; the frame's FLIP rises 0.007, the salmon having stood in for the gold clouds low toward the sun. The bottom colour toward the sun solves to a red with no green or blue: no clear pixel there holds it. Tried and dropped: the trim alone deciding the clear pixels (solves the darkest third, darker still), cloud pixels read at a small weight (a pink sky, residual 0.10), and the unseen terms tied to the seen ones (a dull mauve band, FLIP 0.6185)",
    },
    {
      method: "genshin:parity cover login-door-recording with the split held at the reference's, then compare",
      outcome: InvestigationOutcome.Superseded,
      result:
        "The cover solve chased a cost that moved: each guess split our own render's clouds from its sky anew. Read at the recording's own split, the dusk solves to bottom 0.54, middle 0.81 and top 0.88, which scores the door recording's FLIP 0.6089 to 0.6006, with a residual of 0.29: every band stays under the recording's cover, 8 to 15 degrees at 16% against 70%, since at that split our clouds stand too little over their sky to be read as cloud",
    },
    {
      method:
        "genshin:parity cover on each hour's frame with our clouds read against our sky drawn with none, then compare on every login frame",
      outcome: InvestigationOutcome.Superseded,
      result:
        "Read at the reference's split, our clouds shaded near their sky's colour counted as clear sky, so the cover solved under it filled the dawn's sky (top 0.94) where its frame stands mostly clear: drawn with the dawn's top at 0.15 alone the frame scored 0.4539 against 0.4950. Read where they move our sky from the same sky drawn with no cloud, every hour solves anew: the dawn to bottom 0.94, middle 0.71, top 0.03, the dusk 0.38, 1 and 0.18, the day 0.99, 0.35 and 0.02, the night 0.99, 0.07 and 0.07, which score the dawn 0.4431, the day 0.4439, the night 0.4456 and the door recording 0.5382 against 0.4950, 0.4447, 0.4498 and 0.5698, the phone's door frame level. Within 3 degrees of the horizon our sky still draws under the recordings' cover, and above 25 none where they show a tenth or more",
    },
    {
      method:
        "genshin:parity cover --heights on the dawn, dusk, day and night frames at once, then compare on every login frame",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The bands' heights solved on every hour at once under the exact reading stand the bottom band 26.3 to 2.4 metres under the walkway, the middle 22.5 under to 5.1 over and the top 24.9 to 606.6 over, the cover's residual over every frame 0.185 against about 0.196, with the dusk's top share 0.5, the day's middle 0.53 and the night's 0.06 and 0.13. The frames score the dawn 0.4382, the day 0.4420, the night 0.4454, the door recording 0.5390 and the phone's door frame 0.4806 against 0.4431, 0.4439, 0.4456, 0.5382 and 0.4785, a better mean. Within 3 degrees of the horizon the day still draws none against the recording's half and the dawn a half against nine tenths, the recordings' haze there reading as cloud; above 25 degrees no hour but the dusk draws any, where the others show a tenth",
    },
    {
      method:
        "genshin:parity clouds on every hour's frame, its statistics reading our clouds against our sky drawn with none, each hour's colours applied, then compare",
      outcome: InvestigationOutcome.Found,
      result:
        "Under the cover read exactly, the clouds' colours solved by spread (lit and shade) score the day 0.4397 against 0.4420 (#fbfcf4 and #b0dbf5) and the door recording 0.5369 against 0.5390 (#fcfcc4 and #ed9ea7), and the dawn 0.4516 against 0.4382 and the night 0.4476 against 0.4454, whose shades solve far darker. Every hour's clouds stand dimmer over their sky than the recordings' (the night's 2.4 times its brightness against 5.5, the day's 2.5 against 3.0) and softer edged",
    },
    {
      method:
        "genshin:parity sky login-door-recording with its residual over every pixel and the scene's sky against the solved one, then with the sun's direction refined with the shape",
      outcome: InvestigationOutcome.Rejected,
      result:
        "The dusk's sky solves to a residual of 0.039 over the 68% of its clear sky it keeps but 0.103 over all of it, and the scene draws the solved sky 0.032 off itself: the gap is the third the fit trims as lit haze, the thin bright cloud and gold glow through the recording's upper sky, which no shape draws. Its sun refined with the shape lands at 0.86, 0.24, 0.46, beside the dusk's light, at 0.036 over the pixels kept and 0.104 over all of them, so the sun's place is not the gap. Removed",
    },
    {
      method: "genshin:parity clouds login-door-recording after the cover change, its colours applied, then compare",
      outcome: InvestigationOutcome.Rejected,
      result:
        "With the cover at those shares the dusk's clouds solve by their colours' spread to lit #fdf4c9 and shade #ef91a3 (residual 0.10), our clouds 2.02 times their sky's brightness against the recording's 2.50; applied, the door recording's FLIP rises from 0.6006 to 0.6087 and its tone from 12.33% to 12.76%. The spread match is blind to place, and by height ours over-cover 0 to 3 degrees (68% against 35%) and 15 to 25 (44% against 17%) while under-covering 8 to 15 (46% against 70%), so brighter clouds pay most where ours stand and the recording's do not. Kept #fdedc4 and #eb8596: the clouds' place by height comes before their colour",
    },
    {
      method:
        "genshin:parity sky login-night-title, set as the night's back and front colours with its shape, then compare",
      outcome: InvestigationOutcome.Rejected,
      result:
        "Night's sky solved over the frame's clear pixels (zenith and horizon away from the sun #141a53 and #182f76, nothing toward it) scores the frame 0.042 of FLIP worse: the trim reads the bright cloud and haze low over the horizon as clouds and solves the clear sky darker than the frame's sky reads as a whole, so the night's colours stand",
    },
    {
      method: "genshin:parity clouds (measureClouds, readCloudStatistics) at every hour, before and after each blur",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Our clouds were cut-outs with a dark rim, their crown's colour read where its blur and the outline's both thinned at the edge. Read as the crown's share of the cloud's own cover, the outline blurred to a fiftieth of a cell and the crown wider, edge sharpness falls toward the recordings' and FLIP moves under 0.002 at every hour. The statistics read our clouds dimmer over their sky than the recordings' and covering less of it; their cloud mask still takes the sky's own gradient for cloud",
    },
    {
      method:
        "genshin:parity clouds at every hour with the clear-sky fit and the cover by elevation, the band counts and heights raised, then cover at every hour and compare",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The cloud mask now fits each sky's clear sky as a smooth cubic surface sunk under its clouds (fitClearSky) over the luminance blurred past a recording's grain, which the night's compression noise had speckled with cloud. By height over the horizon, the recordings' skies hold 90 to 100% cloud within 8 degrees at every hour, the dusk's about 90% at every height and the dawn's a fifth above 25 degrees; ours, the middle band at 60 and the top at 36, held a third to a half of that, and the top band, standing 105 metres up, left 8 to 25 degrees bare. Each band's share an hour draws is solved on that cover by the simplex (genshin:parity cover) over 240 middle and 240 top clouds, the top from 60 metres up, to within 0.07 to 0.13 of the sky's cover at dawn, dusk and night and 0.25 by day: the dawn's frame scores 0.005 better, and the dusk's sky reads clouded whole as the recording's does, while a score comparing pixels charges every cloud off the recording's place, its FLIP rising 0.03 as its blurred tone fell 1.6 points. At the day's and the night's solved cover their frames scored 0.03 to 0.05 worse and the day's solved cloud colours worse again: their clouds read grey and dark where the recordings' are white and pale, so they keep their former cover",
    },
    {
      method:
        "genshin:parity sky login-dawn-title over the clear sky the cloud mask leaves, its zenith colours applied, then compare",
      outcome: InvestigationOutcome.Rejected,
      result:
        "The dawn's sky solved over only the pixels the cloud mask reads clear (readCloudSky in place of the solve's own trim) reaches no pixel low over the horizon, all of it cloud and haze, so only its zenith colours are held; those alone scored the dawn worse (FLIP 0.501 to 0.506), and the solver keeps its own trim",
    },
    {
      method:
        "genshin:parity cover login-dawn-title,login-day-title,login-door-recording,login-night-title --witness login --heights, then compare --all with every hour's solved shares, then with the day's and the night's former shares",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The bands' heights solved once for every hour, on the dawn's, the day's, the night's and the door recording's cover at once, each hour's shares solved again under them by turns: the cloud sea from 17.3 to 6.7 metres under the walkway, the middle cumulus from 23.6 under to 9.8 over and the top from 31.6 to 396.9 up, with a residual of 0.27 of the sky's cover over the four (night 0.09, dawn and dusk 0.29, day 0.35, our day's clouds reading clear at the recording's split under 8 degrees). With the dawn's and the dusk's solved shares the door recording's FLIP falls from 0.6006 to 0.5768 and its tone from 12.33% to 11.25%, the others within a thousandth; the day's and the night's solved shares scored their frames 0.010 and 0.017 worse and the wiki's door frame 0.022, so those two keep their former shares. The dusk still covers 8 to 15 degrees at 14% against the recording's 70%, so its colours wait on placement",
    },
    {
      method:
        "genshin:parity sky on login-dawn-title, login-day-title and login-night-title, each solve applied and compare run on every login frame, then sky's drawn line with the god rays' pass left out of createPostPipeline",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Each hour's sky solved over its title frame's clear sky. The dawn's, residual 0.021 over its clear sky, draws 0.094 off its frame against 0.150 before and lowers its FLIP from 0.5012 to 0.4943, so it ships. The day's, residual 0.018, toward the sun a yellow green the frame barely shows, holds its own frame level and leaves the phone's door frame 0.4529 to 0.4628. The night's, residual 0.009 with a moon glow the sky state does not yet set, lowers the clear sky's ceilings and raises the frame from 0.4492 to 0.4627: our clouds' cover near the horizon is a fiftieth of the recording's, and the old brighter sky stood in for them. With the god rays' pass out of the chain every drawn sky but the day's lands nearer its solve (dawn 0.059, night 0.047), the pass mixing the sky toward its blanked colour by the lit air along each ray",
    },
    {
      method: "genshin:parity cover login-night-title, then clouds login-night-title, under the night's solved sky",
      outcome: InvestigationOutcome.Rejected,
      result:
        "The night's cover solved alone under its solved sky fits worse than what ships (residual 0.218 of the sky's cover), its bands unable to stand clouds low on the horizon without standing more high over it; and clouds there reads a shade of #34012d over 386 of our pixels against 1973 of the recording's, too few to trust",
    },
    {
      method:
        "genshin:assets tree login --root LoginScene, then --root Eff_SeaOfCloud_Login, then the sea plane at Cloud_Back's height and compare on every login frame",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Eff_SeaOfCloud_Login hangs at the origin's CloudEffect anchor 67.5 back, its three emitters empty anchors with particle systems: Cloud_Back 14 metres under the walkway and 27 further back, Cloud_Back02 and Cloud_Back03 1.7 under, some 215 to either side. Our sea moved from 20 metres under to Cloud_Back's 14, each hour's haze density rescaled so its profile stands as it was, scores the dawn 0.3888, the day 0.4396, the night 0.4003, the door recording 0.5246 and the phone's door frame 0.4789, level or better on every frame",
    },
    {
      method: "genshin:parity clouds on the night title, the shade raised to #3d85d8, then clouds and compare",
      outcome: InvestigationOutcome.Rejected,
      result:
        "The night's clouds stand 2.41 times their sky's brightness against the recording's 5.54, mostly at their shade colour; that shade raised halfway to the lit one stands them at 3.10 and scores the night 0.3735 against 0.3674, their spread falling from 0.85 to 0.52, since brighter clouds where the recording has none cost more than the ratio gains. Kept",
    },
    {
      method:
        "rank and sky on login-door-recording, then the extract's inventory and the decompiled programs of the shader Enviro_Cloud_Layer_Mat names (Shader#8 in 00/12903389.blk), and Cloud_LOD0's bounds",
      outcome: InvestigationOutcome.Found,
      result:
        "The dusk's clear sky is its largest term a light can reach (0.084 of its 0.52 over the top third, 0.052 over the middle), yet its mean stands on the recording's (#a96f7c against #a86d7b): what is off is the thin cloud, the wisps and the rays over it, which no shape of the sky draws. The login draws a cloud layer the scene lacks: Cloud_LOD0, a dome 0.94 across and 1.35 high, under Enviro_Cloud_Layer_Mat, whose pixel program reads a weather map over the dome's coordinates, a Voronoi density map scrolled at two scales and bent by a curl texture, a normal map lighting each cloud between its light and dark colours toward and away from the sun, and a wisps texture whose alpha over the wisps' coverage blends cirrus in. Its coverage, opacity, height, tiling, wisps' coverage and four colours are the environment system's _ES_ values, set at run time from no asset, so they are measured hour by hour as the sky's colours are",
    },
    {
      method:
        "genshin:parity sky on every hour's frame under the game's tone curve (Display.reference.ts), first in scene colour as before, then each pixel weighed by the curve's slope (getToneSlope), then over every reference at its hour at once, each applied and scored by compare on every login frame against the same tree's sky solved under the neutral curve",
      outcome: InvestigationOutcome.Adopted,
      result:
        "In scene colour the curve's inverse stretches a pixel near white to about thirteen, so the brightest pixels decide the solve: the day's horizon came out pure blue and its drawn sky stood 0.62 off its frame in scene colour. Weighed by the slope, every hour's drawn sky stands nearer its frame as the screen shows it, the night's 0.060 to 0.041 and the day's 0.119 to 0.095. Solved on its title alone, the day's sky scored the title 0.475 against 0.505 and the phone's door frame 0.511 against 0.479, the two frames' sky patches solving to skies far apart (a zenith of none on one, a white horizon on the other); over both at once, which ships with the night's over its title and door session, the night title scores 0.464, the dawn 0.427, the day 0.469, the door session 0.500 against 0.525 and the door recording 0.583 level, while the phone's door frame stands at 0.503. Where every reference shows cloud, low toward the day's sun, the solved halo stands a yellow green no pixel holds, which the cloud layer covers once it is drawn",
    },
    {
      method:
        "A scratch probe at login-door-session's solved camera, then login-door-recording's: the cloud layer's port drawn over the game's own Enviro_Clouds textures served to the page, scored by FLIP over the sky above the horizon where no part stands; its wisps alone at coverage 0.8 at 32 turns of their strip, at full coverage at four, and its density at half coverage, full opacity and a tiling of two",
      outcome: InvestigationOutcome.Rejected,
      result:
        "The wisps' alpha peaks at 0.35, so a wisps' coverage under 0.65 draws none, and at full coverage they veil the whole night sky grey (0.374 to 0.51-0.55). At 0.8 no turn of 32 scores the night's sky under the layer drawn with none (0.3741 at best, 0.3785 at worst), nor the dusk's by more than 0.0003 (0.5092 against 0.5095); the density at a guessed half coverage covers the night's clear sky. FLIP over the sky does not price the layer, so its settings are not solved on it",
    },
    {
      method:
        "The same probe at the night's solved camera with the cloud bands' night shares changed: the top band off, the middle and top off, the top at half and full, the middle at half",
      outcome: InvestigationOutcome.Found,
      result:
        "The night's sky scores 0.3741 as shipped, 0.3703 with the top band off and 0.3501 with the middle and top off; the top at half 0.4549 and at full 0.5536, the middle at half 0.4006. Every cloud of ours costs the sky more than it gains, since FLIP charges a cloud out of the reference's place twice, where ours stands and where the reference's does, so no score by pixels judges clouds the game places at random. The cloud tools (clouds, cover) read the sky at the scene's own camera, which at the door session stands off the frame's glide, so their sky mask held the frame's towers as sky there",
    },
    {
      method:
        "genshin:parity passes login --pass Atmosphere: at login-door-session's solved camera, the sky neither the exports' parts nor the scene's own cover, each image's clouds split alike from its own clear sky, the two skies' statistics held within the spread two halves of the reference's own sky stand apart over chequerboards of 32, 64 and 128 pixels at 960 across",
      outcome: InvestigationOutcome.Found,
      result:
        "With the scene's own parts left in the mask, the scene drew them only where the witness drew none, so they were read as sky until the witness's families were hidden first. Over 116880 pixels of sky the clear sky stands 1.47 ΔE off (gate 2.3), the cover 0.143 (gate 0.074), ours 49% within 3 degrees of the horizon against 25% and 6 to 16% above against 20 to 26%, the clouds 8.96 times their sky against 7.59 (0.166 against 0.051 as a log ratio), their edges 0.024 (gate 0.035) and their spread 0.002 (gate 0.066): the cover and the brightness fail",
    },
    {
      method:
        "genshin:parity layer login-door-session --witness login, held with the layer's port: the layer over the game's own Enviro_Clouds textures at the camera, its opacity, coverage, tiling, height and wisps' coverage and opacity solved by the simplex on the pass's readings each over its gate, then the three bands' shares with them",
      outcome: InvestigationOutcome.Found,
      result:
        "Its settings solve to an opacity of 0.60, a coverage of 0.16, a tiling of 1.94, the wisps' coverage 0.94 and opacity 1.1, the bands barely moving (the middle 0.06 to 0.10): the brightness holds (0.009), the edges and spread hold, the cover falls from 0.143 to 0.104, its upper bands from 6 to 16% to 11 to 25%, and the clear sky's colour rises to 2.58 ΔE past its gate, the layer's thin cover tinting it. Within 3 degrees of the horizon our cover stays near 54% against 25% under every share the simplex tried, so what reads as cloud there is likely the haze over the cloud sea rather than the layer or the bands",
    },
    {
      method:
        "genshin:assets fit login --only cloudLayerTextures, then genshin:parity layer login-door-session --witness login --ours at the settings solved over the game's textures, then its settings solved again over ours",
      outcome: InvestigationOutcome.Found,
      result:
        "Each of the game's cloud textures is fitted as its channels' spectra by radius and direction and their values' quantiles (fitCloudLayerTextures), its normal map as the height its slopes are of, the wisps at half size by eight bands of rows, and drawn back at load (createCloudLayerTextures, about half a second on this machine): the density's channels stand uncorrelated and the curl's two at -0.61, so only the curl's share their phases. Random phases draw no thin streak, so our wisps are tufts where the game's are lines. Drawn at the game textures' settings, ours read the cover 0.113 against their 0.102 and the clear sky 3.2 against 2.7 ΔE; solved over ours, the cover 0.101, the clear sky 2.46, the brightness, edges and spread holding",
    },
    {
      method:
        "The same with the door frame held at heldScrolled 320, where its towers stand (Arrangement.reference.ts), so its own towers leave its sky: passes --pass Atmosphere, then the layer solved over ours from the last settings",
      outcome: InvestigationOutcome.Found,
      result:
        "Clear of its towers the frame's sky holds far more cloud low down (55% and 46% under 8 degrees, against 25% when its towers read as clear sky), and its halves stand further apart, the cover's gate 0.16. With no layer the cover fails at 0.275 and the spread at 0.23 against 0.075, our clouds' brightness straying further inside them than the game's; the layer solved from the last settings holds the cover (0.147) but fails the brightness, edges and spread, scoring worse over every reading than none, so no hour draws it yet. The spread is the clouds' own colours, owed their re-solve",
    },
    {
      method: "genshin:parity clouds login-door-session --witness login with the frame held at heldScrolled 320",
      outcome: InvestigationOutcome.Superseded,
      result:
        "The spread match read 261 pixels of our clouds against 873 of the reference's and solved a lit #50c8f9 over a shade of #000085, too few to trust: it read the sky at the scene's own camera rather than the reference's solved one, and its clouds by a fixed brightness over our clear sky rather than the clear sky the pass fits. Removed, its colours solved by layer on the pass's own readings",
    },
    {
      method:
        "genshin:parity layer login-door-session --witness login --ours with lit and shade, the clouds' colours as the screen shows them, solved component by component by the simplex from the night's shipped #56b0f5 and #255abb over 150 steps, at heldScrolled 320",
      outcome: InvestigationOutcome.Rejected,
      result:
        "Drawn at the shipped colours the layer's readings are the pass's own (cover 0.2696 against 0.2695). Solved, the lit colour runs to #00d6f3 (its red under none, which the curve's inverse holds at its floor) and the shade to #2459df: the clear sky falls from 2.86 to 1.62 ΔE and the spread from 0.236 to 0.058, both inside their gates, and the cover from 0.270 to 0.266, still over its 0.16; but the clouds stand 8.99 times their sky against the game's 7.93 where the shipped stood 7.73 (0.124 against a gate of 0.128, from 0.027), and their edges 0.0075 from 0.0055. It holds one gate more than the shipped colours without beating them on every reading, so the shipped colours stay: two flat colours trade the clouds' brightness over their sky against their spread inside them",
    },
    {
      method:
        "genshin:parity layer login-door-session --witness login --ours at heldScrolled 320, the layer's opacity, the sky's coverage, the tiling, the height and the wisps' coverage and opacity solved by the simplex over 150 steps from a fresh start at an opacity of 0.05 (coverage 0.16, tiling 1.94, height none, wisps 0.7 and 1), against the layer drawn at none",
      outcome: InvestigationOutcome.Rejected,
      result:
        "The simplex keeps the layer thin, an opacity of 0.066 under a coverage run below none (-0.12), the tiling 1.97, the height 0.07 and the wisps 0.68 and 1.13: it tints the clear sky, which falls from 2.86 to 0.90 ΔE, and the spread eases from 0.236 to 0.221, still past its 0.076; but the cover rises from 0.270 to 0.276, the brightness from 0.027 to 0.071 and the edges from 0.0055 to 0.0061. It beats drawing none on two readings of five, so the night draws no layer: what the layer reaches is the clear sky's colour, which the sky's own colours own",
    },
    {
      method:
        "The same solve on login-dawn-title, login-day-title and login-door-recording (the dusk), each beside the layer drawn at none on the same frame",
      outcome: InvestigationOutcome.Rejected,
      result:
        "The dawn's layer (opacity 0.07) lowers the cover from 0.271 to 0.191, the brightness from 0.231 to 0.038 and the spread from 0.579 to 0.308, but takes the clear sky from 1.59 to 3.98 ΔE and the edges from 0.092 to 0.093; the day's (0.14) lowers the cover, the brightness, the edges and the spread and takes the clear sky from 4.07 to 6.80. The dusk's beat drawing none on all five (clear sky 6.36 to 2.74, cover 0.060 to 0.053, brightness 0.143 to 0.084, edges 0.075 to 0.026, spread 0.345 to 0.068), but under a coverage below none (-0.11), outside the game's range of none to one: held at none, as solved and solved again, its readings stand where none's do (clear sky 6.74). The coverage also scales the cloud bands' lit colour (createCloudBandSprite), so below none it darkened the dusk's clouds rather than drawing a layer; the dusk's clouds stand too bright, which their colours' solve owns. No hour draws the layer",
    },
    {
      method:
        "The layer's textures synthesized in idle moments after the mount and swapped into its texture nodes, then written in place into blank textures of their sizes the layer was built over, each read at the night's layer settings above against the textures synthesized before the mount, their texels hashed alike",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Synthesis takes about 0.19 seconds for the density, 0.17 for the wisps and 0.02 to 0.03 for the curl and the normal map, so each is drawn in an idle moment of its own. Swapped in as new textures with the same texels, filters and wrapping, the layer read differently (edges 0.077 against 0.006, cover 0.188 against 0.276), the swapped textures drawn without their mipmaps; written in place it reads the same to four places. The game's own textures, which layer swaps in the same way, may have been read without theirs, so the readings over them above are owed a repeat",
    },
    {
      method:
        "genshin:parity layer login-door-recording --witness login --ours with lit and shade solved from the dusk's shipped #fcfcc4 and #eb8596 over 150 steps, then the measure read for which of its statistics see a cloud's hue",
      outcome: InvestigationOutcome.Found,
      result:
        "Solved, the dusk beat its shipped colours on every reading (clear sky 6.36 to 2.01 ΔE, cover 0.060 to 0.043, brightness 0.143 to 0.017, edges 0.075 to 0.039, spread 0.345 to 0.054) with a lit #f7f7e7 over a shade of #f000c9, its green run under none: every cloud statistic read brightness alone, the clouds' contrast, cover, edges and spread, so no reading saw the shade's hue, nor the night's lit #00d6f3 above. The pass now reads the clouds' mean colour in CIELab beside the clear sky's (readSkyComparison), gated at the colour gate or the halves' own spread, whichever is wider",
    },
    {
      method:
        "The dusk's and the night's colours solved again with the clouds' colour read, each beside its shipped colours drawn at none, at the door recording and at login-door-session held at heldScrolled 320",
      outcome: InvestigationOutcome.Found,
      result:
        "Under the shipped colours the dusk's clouds stand 9.9 ΔE off the recording's (L 81.9, a 8.1, b 21.7 against 78.0, 14.2, 14.9) and the night's 13.7 (a 3.9 and b -31.5 against -0.8 and -44.3, ours greyer). Solved, the dusk's lit #fffcd0 and shade #d853af take the clouds' colour to 3.6 against a gate of 4.2, the clear sky to 2.85, the edges to 0.028 and the spread to 0.086, every one but the cover nearer, and the cover from 0.060 to 0.067 still inside its 0.11: four gates held where the shipped hold one. The night's lit #00bbff and shade #0094dc take its clouds' colour to 3.9, the cover to 0.17 and the spread to 0.014, but the clear sky from 2.86 to 3.17 and the brightness from 0.027 to 0.103. Neither beats its shipped colours on every reading, so both wait on whether a reading still held that moves within its gate may be traded",
    },
    {
      method:
        "The dusk's solved colours set in LoginSkyStateMap as #fffcd0 and #d853af, read again from the scene's own sky state, then compare login-door-recording under them and under the shipped",
      outcome: InvestigationOutcome.Adopted,
      result:
        "A solve ships where no gate it holds fails and every reading past its gate moves nearer, so the dusk's colours ship and the night's, whose clear sky moves further, stay. Written as bytes the colours read the clouds' colour 3.10, the clear sky 2.87, the cover 0.070, the edges 0.027 and the spread 0.089 against the solve's own, and the brightness 0.146 against the shipped 0.143: the lit's green and blue rounded to a byte move it 0.009, so the reading resolves no finer than a byte of colour. The frame scores FLIP 0.5939 against 0.5831 and tone 12.25% against 11.95%, as a score by pixels charges every cloud standing elsewhere than the recording's",
    },
  ],
  openQuestions: [
    "The cloud layer's settings by hour: solved from an opacity near none on every hour's frame, no hour's layer beats drawing none on every reading, each staying thin and trading the clear sky's colour against its clouds; what the layer would draw is read again once the clouds' own colours and the sky's hold, its coverage kept within none to one, and named from the environment scripts where a curve reads it",
    "The dusk's clouds' colours on the atmosphere pass's readings (layer with lit and shade), since a coverage below none darkening their lit colour beat drawing none on every reading of the door recording",
    "The readings over the game's own cloud textures, which layer swaps into the texture nodes and so may draw without their mipmaps",
    "The sky's own colours by day and at night, the dawn's and the dusk's being solved over their frames' clear sky (the dawn title's and the door recording's): the game's environment system sets its sky shader's _ES_ colours, top and bottom toward the sun and away, the halo, the sun's halo and the moon's glow, at run time from no asset the export holds, so they are measured; one frame's sky by least squares (genshin:parity sky) leaves its shape and its colours unsettled, the sun's direction itself measured and most of the sky under clouds and haze",
    "The dusk sky low on the frame's left: the recording's clear sky there is almost all cloud, so the sky solved over its clear pixels draws a dusty rose band where the recording glows gold, and its bottom colour toward the sun is held by no pixel",
  ],
};
