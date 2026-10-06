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
  ],
  openQuestions: [
    "The sky's own colours by day and at night, the dawn's and the dusk's being solved over their frames' clear sky (the dawn title's and the door recording's): the game's environment system sets its sky shader's _ES_ colours, top and bottom toward the sun and away, the halo, the sun's halo and the moon's glow, at run time from no asset the export holds, so they are measured; one frame's sky by least squares (genshin:parity sky) leaves its shape and its colours unsettled, the sun's direction itself measured and most of the sky under clouds and haze",
    "The dusk sky low on the frame's left: the recording's clear sky there is almost all cloud, so the sky solved over its clear pixels draws a dusty rose band where the recording glows gold, and its bottom colour toward the sun is held by no pixel",
  ],
};
