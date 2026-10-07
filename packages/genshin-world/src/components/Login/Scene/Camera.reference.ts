import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// The login's camera: every pose searched and solved, the glide past the towers, and the hours' recordings
export const cameraTopic: ReferenceTopic = {
  investigations: [
    {
      method:
        "The exports drawn from the scene's derived pose (0, 15.2, 105, heading 0, pitch -3.37, fov 45) against login-day",
      outcome: InvestigationOutcome.Found,
      result: "Shape 0.318, the same as our kits': the camera, not the kits, is the first loss",
    },
    {
      method:
        "solve-camera login-day, edge distance, stage and walkway at the origin: x -8 to 8 by 4, y 2 to 14 by 4, z -60 to 140 by 20, heading 0 to 330 by 30 (2640 poses), then the simplex from the best three",
      outcome: InvestigationOutcome.Rejected,
      result:
        "5.23 px at (-5.35, 2.83, 81.07), heading 140.7, pitch -2.0, fov 46.1: facing almost nothing. Rejected: the reference's clouds are most of its edges, and a flat frame's noise read as edges; the edge floor was added",
    },
    {
      method:
        "The same with the edge floor: x -6 to 6 by 3, y 2 to 14 by 4, z 20 to 160 by 20, heading -30 to 30 by 10 (1120 poses)",
      outcome: InvestigationOutcome.Rejected,
      result:
        "9.27 px at (3, 6, 100), heading 10, pitch -3, against 11.23 px at the derived pose: the walkway fills the frame's foot where the reference's is narrow. Rejected",
    },
    {
      method:
        "A landmark solve from six hand-read tower positions, widths and tops and the walkway's edges at the frame's foot, 400000 random poses then a local refinement, no rendering",
      outcome: InvestigationOutcome.Rejected,
      result:
        "Stage: cost 5.62 at (-0.17, 17.37, 207.69), heading -2.5, pitch 10.4, fov 60.9; Build_All: 9.13. Its render matched neither: too weak a signal on its own",
    },
    {
      method:
        "solve-camera login-dawn, login-dusk, login-night by the towers' long vertical lines, Build_All with the walkway: x -8 to 8 by 4, y 1 to 13 by 4, z -90 to 150 by 30, heading 0 to 340 by 20 (3240 poses)",
      outcome: InvestigationOutcome.Rejected,
      result:
        "7.74 px at (-4.56, 13.35, -0.87), heading 219.6, pitch 3.2, fov 45.4: into the tower forest with no walkway. Rejected: more towers always find a nearer line",
    },
    {
      method: "Build_All from (0, 12.5, -110), heading 180, pitch 3",
      outcome: InvestigationOutcome.Rejected,
      result: "14.22 px: the walkway lines up, the towers float cut off above the cloud sea and crowd the frame",
    },
    {
      method:
        "The same three skies by lines over the stage, on the walkway facing the door: x -4 to 4 by 4, y 8 to 16 by 4, z 20 to 160 by 20, heading -20 to 20 by 5 (648 poses)",
      outcome: InvestigationOutcome.Rejected,
      result:
        "8.71 px at (3.99, 8.98, 20.06), heading 5.0, pitch 3.0, fov 45.0: at the end of the range searched, with the towers on the wrong sides. Rejected",
    },
    {
      method: "The stage from z -20 facing +z (heading 180)",
      outcome: InvestigationOutcome.Rejected,
      result: "12.39 px: almost no towers that way; the forest lies toward -z",
    },
    {
      method: "The stage's placements mirrored across its axis, from (-4, 9, 20), heading -5",
      outcome: InvestigationOutcome.Rejected,
      result:
        "13.48 px but a gothic tower near the left and a column and arched bridge on the right, as the reference; the walkway still wrong. Its search (729 poses) was stopped once the walkway's place was found wrong",
    },
    {
      method: "Which references share a pose, by their towers' lines",
      outcome: InvestigationOutcome.Found,
      result: "Dawn, dusk and night share one; the day sky is another",
    },
    {
      method: "A clip for the flight down the walkway",
      outcome: InvestigationOutcome.DeadEnd,
      result:
        "None: Start and End hold a constant 50-metre lift, Ani_Login_Lift moves between them; the flight is the MonoLoginScene script's",
    },
    {
      method: "Why two door renders at poses 90 metres apart came out identical",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Every door-stage solve scored the scene's own camera: the scene's bindings rewrite its camera on each frame the stage animates, so the pose set was lost before the shot; the witness now freezes the camera's matrix and refuses a pose the drawn matrix does not hold",
    },
    {
      method:
        "The flight's first and last poses by perspective from the walkway's known widths, in place of the line-distance search",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Door end: 45.3 metres short of the door, 3.94 over the walkway, pitched 6.9 up, a 51.2 degree field of view; dawn: 72.1 short, 3.98 over, 5.6 up, 44.6. From the crossbars' and the door's pixel widths (focal length and distance) and the rows they stand at (eye height); the witness render at each lines the walkway, crossbars and door up on the capture",
    },
    {
      method:
        "solve-camera login-door by vertical and horizontal lines: y -4 to 10 by 2, z 45 to 105 by 15, pitch -3 to 6 by 3, fov 42.76 and 55 (320 poses)",
      outcome: InvestigationOutcome.Rejected,
      result:
        "12.67 to 12.75 px from heights 10 metres apart, and every one scored the scene's own camera: the line distance does not pin height and was never checked against a render",
    },
    {
      method:
        "genshin:parity pose login-door-recording --witness login --hold fov --refine 80 --families Door, then track",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The door alone: its dais's front feet (852, 777 and 1069, 777) and its arch's apex (959, 416), the field of view held at 51.2 from the widths, solve to 0.76 pixels root mean square, and five simplex steps on the door's part boundaries bring them from 0.66 to 0.25 pixels of the recording's edges at 480 wide: the eye at (-25.66, 36.71, -59.32), heading 3.16, pitch -2.04, 10.9 metres in front of the door and 2.6 above its foot. The walkway, the towers and the bridges draw no boundary from there, so in the static layout nothing else is in view of the door; track holds that pose across 13.5 to 14 seconds within a few centimetres",
    },
    {
      method:
        "genshin:parity pose login-door-recording --witness login, the wings then the door with --hold pitch,fov, then both families together on their silhouettes",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The door's pitch was its three points' weak axis: the walkway's wings (the tops of their outer faces' ends) and its converging edges put the horizon near row 675, the camera 6 degrees up, and the door fits as well at that pitch (0.23 pixels of edge). With the door's heading and pitch held to the walkway's, the two poses place the door on the walkway's top, centred, 3.1 metres beyond the near wings' outer faces. The walkway's two pairs of wings look alike, so the solve could not tell its ends apart; ModelCamera's half turn about y says the camera looks along +z, which brings the door to the walkway's far end (its centre at 7.61 of 8). Set as the door spawn's position, one eye (-0.06, 1.27, -3.07), heading 180.5, pitch 5.29, field of view 51.2 lands both families' silhouettes at 0.81 pixels of the recording's edges at 480 wide, and the seven landmarks reproject at 5.9 pixels root mean square at 1920, the hand-read corners' own error. Scored on part boundaries the walkway read 3 to 4 pixels: its 23 blocks meet along its painted cracks",
    },
    {
      method:
        "Slit scans of yt-rBnfA4pXw6U and yt-q2pwx24TOgA across the title and the door, then genshin:parity's refine on the walkway's edges below row 760 from z -21 to -5 over the copied witness",
      outcome: InvestigationOutcome.Found,
      result:
        "The idle title and the loading are one glide: the recording's wing pairs keep coming at the camera and passing out of frame while its walkway's far end holds the same rows (730 to 745 of 1080) for all 14 seconds, its far blocks stacked at several heights as they rise into place. The camera does not move: from every start along two wing periods, its frame at 0.6 seconds refines to the door frame's height, pitch and field of view (1.1 to 1.3 metres, 5.3 degrees, 51.0 to 51.4), so the spawn records are each row's copies and length, laid end to end and scrolled past it, the walkway's 16 its own length",
    },
    {
      method:
        "genshin:parity glide login-door-recording over 0 to 2.5 and 9 to 14.5 seconds, the eye 1.24 metres up, pitched 5.29 under 51.2, its held frames picking the spans that do not stall",
      outcome: InvestigationOutcome.Adopted,
      result:
        "At the camera's pose each ground row is a distance, so the paving's column 6.3 to 9.5 metres ahead resampled into metres and correlated frame to frame reads the glide: 3.03 metres a second, steady to 0.06 over the title's 2.4 seconds, about 3.7 once preparing (3.5 to 3.9 between 9.75 and 11), then slowing by 0.55 a second each second, a line through its last three seconds, 1.9 by 13.75 seconds, before the click rushes on at 14.4. At 44.6 degrees the same frames read anything from 1.1 to 4 metres a second, so the title shares the door's field of view. The recording stalls from 2.7 to 9 seconds as the game loads, the frames held then jumping, so only the spans around it are read",
    },
    {
      method:
        "yt-dlp searches for the login at each hour, the far end's rows across builds, then genshin:parity view of ours beside the exports at every 4 metres of the loop and compare at every metre from 120 to 142 (the day's from 100), each frame held",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The wiki stills fit no centred camera, so they are replaced. Public recordings of the PC client idling on the title with no interface show the hours at the glide's camera: dawn (yt-sQNqMfmfkZU, 2023), day (yt-7kK6HqVfASk, 2022, its top and bottom 50 rows masked) and night (yt-PnqNza4qWzs, 2022) stand the walkway's far end on the door recording's rows, where the 2021 recordings stand it some 30 rows lower, another camera. Each frame is held at the glide's moment its towers stand at (heldScrolled): night 135 metres and dawn 132, where the lantern tower and the ringed tower frame the walkway as in the frame, peaking the shape score at 0.412 and 0.421; the day's score runs flat under its dense haze, so its 118 is where genshin:parity parts lands the exports' lantern tower and the near tower left of the walkway on its own, scoring 0.394",
    },
    {
      method:
        "genshin:assets tree login for ModelCamera and LoginCamera, and genshin:assets behaviours login --script '^(Camera|Light)#' over the raw exports of the login's built-in components",
      outcome: InvestigationOutcome.Found,
      result:
        "The camera is exact data the pose was solved without. ModelCamera stands under SceneObj at 0, 60, 0, six metres over BridgeBeginNode at the scene's tenth, turned half a turn about an axis 0.05 toward z, a pitch of about 5.73 degrees; LoginCamera, at the origin, carries the one Camera component, whose bytes hold a near plane of 0.25, a far plane of 600 and a vertical field of view of 45. The pose solved on the door recording stands the eye 1.24 metres over the walkway pitched 5.29 degrees under a field of view of 51.2, and the towers' row 2.47 metres across, 5 down and 8.94 nearer than the blocks lay it. MonoLoginScene's speeds, curves and distances may move the camera at run time, so which is drawn is the camera pass's to settle against the exact values before any later pass is trusted",
    },
  ],
  openQuestions: [
    "Whether the login draws from ModelCamera's place and LoginCamera's field of view of 45, against the pose's 1.24 metres, 5.29 degrees and 51.2: what of MonoLoginScene moves or widens the camera, and how much of the towers' row offset the exact camera explains",
    "How the game brings the towers to the door's phase after a long idle: every recording found idles a few seconds, so the title's phase is read off its glide's length, not a rule of the script's",
    "Where the glide comes to rest: the recording's door frame was still slowing at 1.6 metres a second when the click came, so the rest stands a little nearer the door than its pose",
  ],
};
