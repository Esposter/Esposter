import type { ComponentReference } from "genshin-interface";

import { GameSourceKind } from "genshin-interface";

// The login scene's sources in the game's data, what every search over them found, and what is still open. Poses are
// In three's axes (metres) with the heading, pitch and field of view in degrees; distances in pixels at 480 wide
export const reference: ComponentReference = {
  findings: [
    {
      found: "Shape 0.318, the same as our kits': the camera, not the kits, is the first loss",
      search:
        "The exports drawn from the scene's derived pose (0, 15.2, 105, heading 0, pitch -3.37, fov 45) against login-day",
    },
    {
      found:
        "5.23 px at (-5.35, 2.83, 81.07), heading 140.7, pitch -2.0, fov 46.1: facing almost nothing. Rejected: the reference's clouds are most of its edges, and a flat frame's noise read as edges; the edge floor was added",
      search:
        "solve-camera login-day, edge distance, stage and walkway at the origin: x -8 to 8 by 4, y 2 to 14 by 4, z -60 to 140 by 20, heading 0 to 330 by 30 (2640 poses), then the simplex from the best three",
    },
    {
      found:
        "9.27 px at (3, 6, 100), heading 10, pitch -3, against 11.23 px at the derived pose: the walkway fills the frame's foot where the reference's is narrow. Rejected",
      search:
        "The same with the edge floor: x -6 to 6 by 3, y 2 to 14 by 4, z 20 to 160 by 20, heading -30 to 30 by 10 (1120 poses)",
    },
    {
      found:
        "Stage: cost 5.62 at (-0.17, 17.37, 207.69), heading -2.5, pitch 10.4, fov 60.9; Build_All: 9.13. Its render matched neither: too weak a signal on its own",
      search:
        "A landmark solve from six hand-read tower positions, widths and tops and the walkway's edges at the frame's foot, 400000 random poses then a local refinement, no rendering",
    },
    {
      found:
        "Build_All's towers are several hundred metres tall, spread far and cut off above the cloud sea; the stage's towers are the recording's kinds",
      search:
        "A contact sheet: both arrangements from each end of the walkway (z 75 and -75), 5 metres up, pitch 3, at eight headings",
    },
    {
      found:
        "7.74 px at (-4.56, 13.35, -0.87), heading 219.6, pitch 3.2, fov 45.4: into the tower forest with no walkway. Rejected: more towers always find a nearer line",
      search:
        "solve-camera login-dawn, login-dusk, login-night by the towers' long vertical lines, Build_All with the walkway: x -8 to 8 by 4, y 1 to 13 by 4, z -90 to 150 by 30, heading 0 to 340 by 20 (3240 poses)",
    },
    {
      found: "14.22 px: the walkway lines up, the towers float cut off above the cloud sea and crowd the frame",
      search: "Build_All from (0, 12.5, -110), heading 180, pitch 3",
    },
    {
      found:
        "8.71 px at (3.99, 8.98, 20.06), heading 5.0, pitch 3.0, fov 45.0: at the end of the range searched, with the towers on the wrong sides. Rejected",
      search:
        "The same three skies by lines over the stage, on the walkway facing the door: x -4 to 4 by 4, y 8 to 16 by 4, z 20 to 160 by 20, heading -20 to 20 by 5 (648 poses)",
    },
    {
      found: "12.39 px: almost no towers that way; the forest lies toward -z",
      search: "The stage from z -20 facing +z (heading 180)",
    },
    {
      found:
        "13.48 px but a gothic tower near the left and a column and arched bridge on the right, as the reference; the walkway still wrong. Its search (729 poses) was stopped once the walkway's place was found wrong",
      search: "The stage's placements mirrored across its axis, from (-4, 9, 20), heading -5",
    },
    {
      found:
        "The door is under the stage at (0, -5, 32.3), 0.4 scale, 8 by 13.5 metres; the walkway's root is dumped at the origin spanning z -75 to 72, so the door stood mid-walkway: the walkway's own parent is in a block not read",
      search: "The door's placement against the walkway's",
    },
    {
      found:
        "12.22 px, and the recording's composition: the walkway straight to the door on its dais, towers either side, arched bridges to the right",
      search: "The walkway moved 107.3 metres along +z so its far end meets the door, from (0, 12, 170), heading 0",
    },
    {
      found: "Dawn, dusk and night share one; the day sky is another",
      search: "Which references share a pose, by their towers' lines",
    },
    {
      found:
        "None: Start and End hold a constant 50-metre lift, Ani_Login_Lift moves between them; the flight is the MonoLoginScene script's",
      search: "A clip for the flight down the walkway",
    },
    {
      found:
        "The mask read nine tenths of the door recording's sky as cloud, its clear lavender sky with it: the clear surface settles under the sky's wisps and its glow toward the sun, which then pass the fixed ratio. Split by Otsu's threshold over that surface the mask is the eye's, about two fifths cloud; the sky solved on its clear pixels scores the recording's FLIP a hundredth better and reads salmon for lavender; cover re-solved on it reads worse than the shipped shares by its own measure, each guess moving the threshold",
      search:
        "genshin:parity clouds, sky and cover over login-door-recording, the cloud mask checked by eye on its sheet",
    },
    {
      found:
        "The salmon dusk was the solve's: it clamped a negative colour to none after a free least squares, leaving the terms that colour cancelled too red (residual 0.21 in scene colour). Solved with none negative over every clear pixel, the shape refined on the pixels within their spread, the residual is 0.039 and the sky lavender away from the sun (#78597f) and rose toward it (#c57a78), its halo a pale gold. The scene's own sky drawn with no cloud stands 0.133 off the recording's clear sky, from 0.143, its mean #98666f against #a86d7b, the right hue and darker; the frame's FLIP rises 0.007, the salmon having stood in for the gold clouds low toward the sun. The bottom colour toward the sun solves to a red with no green or blue: no clear pixel there holds it. Tried and dropped: the trim alone deciding the clear pixels (solves the darkest third, darker still), cloud pixels read at a small weight (a pink sky, residual 0.10), and the unseen terms tied to the seen ones (a dull mauve band, FLIP 0.6185)",
      search:
        "genshin:parity sky login-door-recording with solveNonNegativeSystem, its drawn line read at each state, then compare",
    },
    {
      found:
        "The recording's dark carving on the walkway is relief, not paint: at the recording's full size its strokes are thin lines down one side of each raised band and along each brick, the side turned from the sun, and the stone's mask holds no metal. Its normal map read over the paving's plan carves each pocket's rim as a bevel of median slope 1.5 about a centimetre wide, leaning into the pocket, so the pockets are sunk, and each joint between two bricks as a shallower groove of slope 0.59, split from the flat stone by Otsu's threshold under the rims'. Drawn as relief on the walkway's tops from the pockets' and the grooves' loops, lit by the scene's own lights, the door recording's shared edges rise from 0.411 to 0.438 and its FLIP falls from 0.6095 to 0.6089, the dawn's, the day's and the phone's door frames level and the night's 0.003 worse; against the exports the walkway's similarity falls from 0.65 to 0.56, our rims wider and darker than theirs at the ranking's size and the exports' middle lane a paler stone than ours",
      search:
        "zoom on the recording's paving at full size, the walkway's mask and normal textures read channel by channel, fitLoginPaving's tilt plan, then compare and rank login-door-recording",
    },
    {
      found:
        "The cover solve chased a cost that moved: each guess split our own render's clouds from its sky anew. Read at the recording's own split, the dusk solves to bottom 0.54, middle 0.81 and top 0.88, which scores the door recording's FLIP 0.6089 to 0.6006, with a residual of 0.29: every band stays under the recording's cover, 8 to 15 degrees at 16% against 70%, since at that split our clouds stand too little over their sky to be read as cloud",
      search: "genshin:parity cover login-door-recording with the split held at the reference's, then compare",
    },
    {
      found:
        "Read at the reference's split, our clouds shaded near their sky's colour counted as clear sky, so the cover solved under it filled the dawn's sky (top 0.94) where its frame stands mostly clear: drawn with the dawn's top at 0.15 alone the frame scored 0.4539 against 0.4950. Read where they move our sky from the same sky drawn with no cloud, every hour solves anew: the dawn to bottom 0.94, middle 0.71, top 0.03, the dusk 0.38, 1 and 0.18, the day 0.99, 0.35 and 0.02, the night 0.99, 0.07 and 0.07, which score the dawn 0.4431, the day 0.4439, the night 0.4456 and the door recording 0.5382 against 0.4950, 0.4447, 0.4498 and 0.5698, the phone's door frame level. Within 3 degrees of the horizon our sky still draws under the recordings' cover, and above 25 none where they show a tenth or more",
      search:
        "genshin:parity cover on each hour's frame with our clouds read against our sky drawn with none, then compare on every login frame",
    },
    {
      found:
        "The bands' heights solved on every hour at once under the exact reading stand the bottom band 26.3 to 2.4 metres under the walkway, the middle 22.5 under to 5.1 over and the top 24.9 to 606.6 over, the cover's residual over every frame 0.185 against about 0.196, with the dusk's top share 0.5, the day's middle 0.53 and the night's 0.06 and 0.13. The frames score the dawn 0.4382, the day 0.4420, the night 0.4454, the door recording 0.5390 and the phone's door frame 0.4806 against 0.4431, 0.4439, 0.4456, 0.5382 and 0.4785, a better mean. Within 3 degrees of the horizon the day still draws none against the recording's half and the dawn a half against nine tenths, the recordings' haze there reading as cloud; above 25 degrees no hour but the dusk draws any, where the others show a tenth",
      search:
        "genshin:parity cover --heights on the dawn, dusk, day and night frames at once, then compare on every login frame",
    },
    {
      found:
        "Under the cover read exactly, the clouds' colours solved by spread (lit and shade) score the day 0.4397 against 0.4420 (#fbfcf4 and #b0dbf5) and the door recording 0.5369 against 0.5390 (#fcfcc4 and #ed9ea7), and the dawn 0.4516 against 0.4382 and the night 0.4476 against 0.4454, whose shades solve far darker. Every hour's clouds stand dimmer over their sky than the recordings' (the night's 2.4 times its brightness against 5.5, the day's 2.5 against 3.0) and softer edged",
      search:
        "genshin:parity clouds on every hour's frame, its statistics reading our clouds against our sky drawn with none, each hour's colours applied, then compare",
    },
    {
      found:
        "The witness's normal target wrote each mesh's own normal, the material's normal node never reaching a basic material's normal, so it is taken from the view into the world from the part's own node: the night's --self read-back moves from 0.061 to 0.056 off over a light of 0.50, its residual 0.013, so the model draws what the renderer draws and the rest is what the bins leave the ramp and the harmonics to trade. Every hour re-solved under it fits its bins closer (the dusk's 0.141 against 0.157) and scores the day level, the door recording 0.5361 against 0.5369 and the phone's door frame 0.4791 against 0.4811, the dawn 0.4414 against 0.4382 and the night level: the day's and the dusk's lights ship, the dawn's and the night's stay",
      search:
        "The witness's normal target checksummed with and without the part's normal node, calibrate --self on the night, then calibrate --write on every hour and compare on every login frame",
    },
    {
      found:
        "The dusk's sky solves to a residual of 0.039 over the 68% of its clear sky it keeps but 0.103 over all of it, and the scene draws the solved sky 0.032 off itself: the gap is the third the fit trims as lit haze, the thin bright cloud and gold glow through the recording's upper sky, which no shape draws. Its sun refined with the shape lands at 0.86, 0.24, 0.46, beside the dusk's light, at 0.036 over the pixels kept and 0.104 over all of them, so the sun's place is not the gap. Removed",
      search:
        "genshin:parity sky login-door-recording with its residual over every pixel and the scene's sky against the solved one, then with the sun's direction refined with the shape",
    },
    {
      found:
        "With the cover at those shares the dusk's clouds solve by their colours' spread to lit #fdf4c9 and shade #ef91a3 (residual 0.10), our clouds 2.02 times their sky's brightness against the recording's 2.50; applied, the door recording's FLIP rises from 0.6006 to 0.6087 and its tone from 12.33% to 12.76%. The spread match is blind to place, and by height ours over-cover 0 to 3 degrees (68% against 35%) and 15 to 25 (44% against 17%) while under-covering 8 to 15 (46% against 70%), so brighter clouds pay most where ours stand and the recording's do not. Kept #fdedc4 and #eb8596: the clouds' place by height comes before their colour",
      search: "genshin:parity clouds login-door-recording after the cover change, its colours applied, then compare",
    },
    {
      found:
        "The login sets the god rays' colour to black, and the pass mixes the frame toward its colour by the lit air along each ray, so it darkens the sky toward the sun by about a quarter where the solve's own model matches the scene's sky at the frame's middle, and every part behind lit air with it. Drawn in the sun's colour the frame washes pale (FLIP 0.647); with the pass out of the chain the frame stands brighter and scores 0.641 against 0.619 at the same sky, every hour's light having been measured under the darkening",
      search:
        "The scene's sky read at six points against computeSkyWeights at the applied state, then compare login-door-recording with the god rays lit, and with the pass left out of createPostPipeline",
    },
    {
      found:
        "Rows within noise of each other: a loss table priced at a pose that fits nothing means nothing, and a recording is too soft to tell a stand-in from its export, so the tool was retired for genshin:parity rank",
      search: "genshin:parity attribute over dawn, dusk and night at (0, 5, 75), heading 0, pitch 3, Build_All witness",
    },
    {
      found:
        "Ani_LogginScene_Door01_Liftting is the door assembling itself over 1.33 s at the flight's end, its pieces rising about 60 metres from below into place; Ani_Login_Lift raises its animator's root 50 metres over a second, easing in and overshooting to 52.5 before settling",
      search: "genshin:assets clips login: what the scene's clips move",
    },
    {
      found:
        "The click lights the door from its middle while the camera pushes toward it, the door growing about 1.7 times in a third of a second and gathering speed, under the white",
      search: "The recording's last second at 15 frames a second (13.6 s to 15.2 s)",
    },
    {
      found:
        "The walkway's top stood 0.33 metres up and the door's foot 5 metres down, so 5.3 of the door's 13.5 metres sank into the walkway and it read short: the walkway's lost parent took its height as well as its place, and the walkway moves 5.33 metres down to meet the door's foot",
      search: "Why the door read short against the walkway",
    },
    {
      found:
        "The walkway 5.33 metres down and 112.3 along did not fix it: the door's width over the walkway's is 0.9 in the recording's last pose and 0.4 in ours, a ratio no camera changes, so the walkway was 2.5 times too large",
      search: "Why the door still read short with the walkway at its foot",
    },
    {
      found:
        "LoginScene holds BridgeBeginNode, DoorNode, SceneBeginNode and ModelCamera at one scale, with LightShaft, MainLight, Moon, Sun, Clouds and Atmosphere: the login hangs the walkway and the door at one scale, so the walkway's lost parent is the door's, 0.4 scale 5 metres down, which brings its end to the door with no shift along its axis",
      search: "The placements under the roots LoginScene, LoginCamera and Eff_SceneCamera_Cloud_Login",
    },
    {
      found:
        "Every door-stage solve scored the scene's own camera: the scene's bindings rewrite its camera on each frame the stage animates, so the pose set was lost before the shot; the witness now freezes the camera's matrix and refuses a pose the drawn matrix does not hold",
      search: "Why two door renders at poses 90 metres apart came out identical",
    },
    {
      found:
        "Door end: 45.3 metres short of the door, 3.94 over the walkway, pitched 6.9 up, a 51.2 degree field of view; dawn: 72.1 short, 3.98 over, 5.6 up, 44.6. From the crossbars' and the door's pixel widths (focal length and distance) and the rows they stand at (eye height); the witness render at each lines the walkway, crossbars and door up on the capture",
      search:
        "The flight's first and last poses by perspective from the walkway's known widths, in place of the line-distance search",
    },
    {
      found:
        "12.67 to 12.75 px from heights 10 metres apart, and every one scored the scene's own camera: the line distance does not pin height and was never checked against a render",
      search:
        "solve-camera login-door by vertical and horizontal lines: y -4 to 10 by 2, z 45 to 105 by 15, pitch -3 to 6 by 3, fov 42.76 and 55 (320 poses)",
    },
    {
      found:
        "SceneObj is in 00/11790361.blk at a tenth of LoginScene's scale, and its five children are in the same file: Atmosphere, ModelCamera, and SceneBeginNode, BridgeBeginNode and DoorNode, empty anchors with no children and no renderer, SceneBeginNode turned a quarter about y. No block is missing: the login's towers are a prefab MonoLoginScene spawns into SceneBeginNode at run time, and the walkway and the door into their own nodes",
      search: "SceneObj's children in the login block's Transform and GameObject dumps, by their path IDs",
    },
    {
      found:
        "Its raw bytes (genshin:assets behaviours) point at the five anchors SceneBeginNode, BridgeBeginNode, DoorNode, CloudEffect and LightShaft, then at three records of a prefab, an integer and a float: LoginScene_Build_All in 16000354 (3, 200), LoginScene_Bridge01_Vo in 16000354 (3, 16) and Eff_SeaOfCloud_Login (2, 300), then at LoginScene_Door01_Vo, the door prefab's root in 11790361. Two curves sit before them at 0x70 (1 falling to 0.02 over a second) and 0xa4 (0.2 rising to 1 over half a second), and two runs of four hours at 0x178 (4.5, 8, 17, 19) and 0x18c (9.5, 18, 23, 6)",
      search: "What MonoLoginScene spawns into its anchors, from the pointers in its raw serialized bytes",
    },
    {
      found:
        "Set as the component's spawns, the tree shows the login as it draws: LoginScene_Build_All's towers, bridges and pillars under SceneBeginNode (237, -180, -533 in SceneObj's units, a quarter turn about y), the walkway's 23 pieces under BridgeBeginNode at SceneObj's origin, and the door prefab under DoorNode (-262, 341, 700), all at SceneObj's tenth. Every walkway piece carries a MonoBlockController, a script of its own, so the walkway's blocks are moved at run time",
      search: "genshin:assets tree login --root SceneObj with the three spawns applied",
    },
    {
      found:
        "The door's dais over the walkway at its foot, left to right along that row: 852, 861, 1058 and 1069 pixels, a cross-ratio of 1.0023, which the stage's fitted data holds (1.0000). Fitted over the spawned arrangement it reads -171: the door's anchor stands 70 metres out and 34 up from the walkway, which spans 16 metres at its anchor, so in the static layout the two never meet and the flight's arrangement is a run-time one. The re-fit was not committed. Bridges and the door fit their exports to the centimetre; the towers' fitted feet sit 6.5 metres from their objects' origins on average",
      search: "genshin:assets arrangement login, before and after a fit over the spawned arrangement",
    },
    {
      found:
        "The door alone: its dais's front feet (852, 777 and 1069, 777) and its arch's apex (959, 416), the field of view held at 51.2 from the widths, solve to 0.76 pixels root mean square, and five simplex steps on the door's part boundaries bring them from 0.66 to 0.25 pixels of the recording's edges at 480 wide: the eye at (-25.66, 36.71, -59.32), heading 3.16, pitch -2.04, 10.9 metres in front of the door and 2.6 above its foot. The walkway, the towers and the bridges draw no boundary from there, so in the static layout nothing else is in view of the door; track holds that pose across 13.5 to 14 seconds within a few centimetres",
      search:
        "genshin:parity pose login-door-recording --witness login --hold fov --refine 80 --families Door, then track",
    },
    {
      found:
        "The door's pitch was its three points' weak axis: the walkway's wings (the tops of their outer faces' ends) and its converging edges put the horizon near row 675, the camera 6 degrees up, and the door fits as well at that pitch (0.23 pixels of edge). With the door's heading and pitch held to the walkway's, the two poses place the door on the walkway's top, centred, 3.1 metres beyond the near wings' outer faces. The walkway's two pairs of wings look alike, so the solve could not tell its ends apart; ModelCamera's half turn about y says the camera looks along +z, which brings the door to the walkway's far end (its centre at 7.61 of 8). Set as the door spawn's position, one eye (-0.06, 1.27, -3.07), heading 180.5, pitch 5.29, field of view 51.2 lands both families' silhouettes at 0.81 pixels of the recording's edges at 480 wide, and the seven landmarks reproject at 5.9 pixels root mean square at 1920, the hand-read corners' own error. Scored on part boundaries the walkway read 3 to 4 pixels: its 23 blocks meet along its painted cracks",
      search:
        "genshin:parity pose login-door-recording --witness login, the wings then the door with --hold pitch,fov, then both families together on their silhouettes",
    },
    {
      found:
        "The idle title and the loading are one glide: the recording's wing pairs keep coming at the camera and passing out of frame while its walkway's far end holds the same rows (730 to 745 of 1080) for all 14 seconds, its far blocks stacked at several heights as they rise into place. The camera does not move: from every start along two wing periods, its frame at 0.6 seconds refines to the door frame's height, pitch and field of view (1.1 to 1.3 metres, 5.3 degrees, 51.0 to 51.4), so the spawn records are each row's copies and length, laid end to end and scrolled past it, the walkway's 16 its own length",
      search:
        "Slit scans of yt-rBnfA4pXw6U and yt-q2pwx24TOgA across the title and the door, then genshin:parity's refine on the walkway's edges below row 760 from z -21 to -5 over the copied witness",
    },
    {
      found:
        "At the camera's pose each ground row is a distance, so the paving's column 6.3 to 9.5 metres ahead resampled into metres and correlated frame to frame reads the glide: 3.03 metres a second, steady to 0.06 over the title's 2.4 seconds, about 3.7 once preparing (3.5 to 3.9 between 9.75 and 11), then slowing by 0.55 a second each second, a line through its last three seconds, 1.9 by 13.75 seconds, before the click rushes on at 14.4. At 44.6 degrees the same frames read anything from 1.1 to 4 metres a second, so the title shares the door's field of view. The recording stalls from 2.7 to 9 seconds as the game loads, the frames held then jumping, so only the spans around it are read",
      search:
        "genshin:parity glide login-door-recording over 0 to 2.5 and 9 to 14.5 seconds, the eye 1.24 metres up, pitched 5.29 under 51.2, its held frames picking the spans that do not stall",
    },
    {
      found:
        "The glide's path at the eye passes through the exports' own bridges and pillars at one place a loop, a pier of LoginScene_Bridge04's 0.4 metres deep 57 metres ahead of the towers' home; every arch and every space under a deck it crosses is open. Our bridges as one side's outline extruded through their depth filled those, and the camera glided into solid stone; as visual hulls they leave them open. A local refinement of the row's height on edges alone read it 0.43 metres too high from the towers' home, which the row's true phase at the door (below) undid",
      search: "genshin:assets clearance login, then genshin:parity view and film --witness at the stretch beside ours",
    },
    {
      found:
        "The towers do glide toward the camera with the walkway, a near tower growing about 1.8 times from 9 to 14 seconds, and the door frames of recordings idle for different times show them alike: the door comes to rest with the towers' row 144 metres along its loop, nine of the walkway's copies, the 2.23-scale lantern tower close to the door's right and the colonnade low behind it. Moved as one with the camera held, from where the lantern tower's bearing puts it, the row lands on login-door-recording's edges 145.8 metres along and on login-door's 144.4, the other axes scattering either way; laid at home instead, the door frame shows thin far towers and a colonnade standing high. The English recording's glide from the title to the door's rest is about 49 metres, so the title opens that far short of it",
      search:
        "genshin:parity parts login-door-recording and login-door --family Towers, view --offsets at the lantern tower's phase, then place --start=0,0,-150 on both",
    },
    {
      found:
        "The bridges and pillars stand 5 metres under where the blocks lay them. At the door frame's pose, solved on the door and the walkway's wings, the colonnade behind the door stood some 50 pixels over the recording's, and the bridge whose deck crosses the glide's path, laid where the blocks lay it, stood its deck 2.3 metres over the eye, so the glide drove into it every loop where the game's passes over it however long the title idles. Lowered 5 metres, the colonnade lands on the recording's rows and that deck passes under the walkway. A camera solved on the towers behind the door as well (0.98 metres up, 11.3 short, 6.2 degrees, 48.3, at 7.2 pixels) traded its own height and pitch for the bridges' height and stood them higher still in the glide, so the door frame's pose stands",
      search:
        "genshin:parity view --offsets on the bridges at 0, 5, 10, 14 and 18 metres beside login-door-recording, zoom --grid on the colonnade's rail, film over a whole minute of the title, and pose with doorPillarTop, doorTowerTop and doorLeftTowerTop added",
    },
    {
      found:
        "The towers stand 5 metres low with their bridges, and their row 2.47 metres toward -x and 8.94 nearer at the door. Pinned on the lantern tower's two silhouette edges at the recording's row 460 and the crowned column's top behind the door with the row's height held, no rigid move fitted, which read as each tower moving on its own; seen beside the recording, the lantern tower stood a ring too high, so its edges were pinned at the wrong height. Lowered with the bridges and moved on the edges alone, its window band, gold rings and edges land on the recording's, the crowned column within 20 pixels and the colonnade where it stood, and every hour's frame scores better. The frame's far-left tower is still another of the row's",
      search:
        "genshin:parity parts login-door-recording --family Towers, place --landmarks columnCrown,towerRightInner,towerRightOuter with --axes z, x,z and x,y,z through the door frame's pose, then view --offsets lowering the towers 5 metres beside the recording, and compare at every hour",
    },
    {
      found:
        "Every login stone material holds _ReceiveShadow 0, yet the references show the towers' shadows across the walkway, so the game shadows its stone otherwise. Drawn without the sun's shadow, the door frame's near faces solve to a sun near three times stronger and a sky light five times weaker (genshin:parity light, converged in four steps), but the door, day and night stills all score worse without the shadow, and with it back that light scores worse than the scene's; the sun's direction is not settled by the faces' shading either, every heading and elevation fitting the recording's near faces within a hundredth of the best",
      search:
        "genshin:assets material values for every LoginScene_ material, then genshin:parity light and haze login-door-recording with and without the light's shadow, and compare at every hour",
    },
    {
      found:
        "The witness smeared every texture whose coordinates run past 0 and 1 into streaks, the walkway's bricks among them, since three clamps a texture's edges where Unity tiles it; tiled, the witness's walkway shows the recording's bricks. A plan of the walkway's tops drawn through their own coordinates, on the CPU and by the witness from straight above alike, lays out its paving in metres: a middle lane of bricks 0.25 metres a course between two light strips, side lanes and wings set with pockets, and a curb, which the recording shows as dark joints and rims. Traced and drawn as lines the paving scores within a thousandth of the bare stone at every hour, as the door's traced relief does, the phone's door frame a little better: the lines are the game's own, kept for the eye",
      search:
        "genshin:parity plan login-door-recording --family Walkway at 50 and 150 pixels a metre, genshin:assets fit login with fitLoginPaving and fitLoginDoor's relief, then compare at every hour",
    },
    {
      found:
        "Each tower section shaded by the colour its mesh paints its sides there, as a share of every tower's mean, scores the phone's door frame 0.008 worse and the day and dusk worse too: the gilding reads as bright orange bands where the game's gold is a metal, dark under the diffuse light and bright only in its highlight. The door casts no shadow: at dusk the sun stands low behind it and laid its shadow down the walkway to the camera, where the recording's walkway is lit, and without it the phone's door frame and the dusk score better. A tower's shadow still lies over the wings in front of the door where the recording's are lit, yet the towers drawn without shadows score the door frames and the dusk worse, so it is the dusk sun's direction or that tower's place that is off, not its shadow",
      search:
        "genshin:assets fit login with fitSectionShades on the towers, then compare at every hour; compare with the door and then the towers casting no shadow",
    },
    {
      found:
        "The door rises at the walkway's far end as its last blocks settle, about 12 seconds in, nothing built past it, and the glide then brakes it to its pose",
      search: "genshin:parity frames yt-rBnfA4pXw6U at 2 a second over 0 to 15 seconds",
    },
    {
      found:
        "The wiki stills fit no centred camera, so they are replaced. Public recordings of the PC client idling on the title with no interface show the hours at the glide's camera: dawn (yt-sQNqMfmfkZU, 2023), day (yt-7kK6HqVfASk, 2022, its top and bottom 50 rows masked) and night (yt-PnqNza4qWzs, 2022) stand the walkway's far end on the door recording's rows, where the 2021 recordings stand it some 30 rows lower, another camera. Each frame is held at the glide's moment its towers stand at (heldScrolled): night 135 metres and dawn 132, where the lantern tower and the ringed tower frame the walkway as in the frame, peaking the shape score at 0.412 and 0.421; the day's score runs flat under its dense haze, so its 118 is where genshin:parity parts lands the exports' lantern tower and the near tower left of the walkway on its own, scoring 0.394",
      search:
        "yt-dlp searches for the login at each hour, the far end's rows across builds, then genshin:parity view of ours beside the exports at every 4 metres of the loop and compare at every metre from 120 to 142 (the day's from 100), each frame held",
    },
    {
      found:
        "Night's sky solved over the frame's clear pixels (zenith and horizon away from the sun #141a53 and #182f76, nothing toward it) scores the frame 0.042 of FLIP worse: the trim reads the bright cloud and haze low over the horizon as clouds and solves the clear sky darker than the frame's sky reads as a whole, so the night's colours stand",
      search:
        "genshin:parity sky login-night-title, set as the night's back and front colours with its shape, then compare",
    },
    {
      found:
        "On the title frames: the exposure scaled dawn and day down a quarter and night up threefold, scoring every hour better (night 0.492 to 0.460); a second step at night, nearer the median, scored worse. The day's haze from 0.04 to 0.195 moves its frame and the phone's door frame by under 0.01 either way, so the washed day is our towers' flat light, not the haze; the light's solve runs away on every hour (a sun 7700 times as blue at dawn), its lit and shaded faces read off stand-ins whose faces are not the game's",
      search:
        "genshin:parity exposure, light and fog on login-dawn-title, login-day-title and login-night-title, then compare at each step and at the day haze's densities",
    },
    {
      found:
        "Drawing the exports in place of every stand-in moves the title frames' FLIP by under 0.01 and the day's the wrong way, so every stand-in term of the frame's ranking read near nothing: a soft recording, light we miss and parts a few pixels off hide what a stand-in lacks. Scored against the exports at the same frame instead, the towers are the largest stand-in gap at every hour, a tenth of the frame's FLIP",
      search:
        "genshin:parity compare --witness login at every hour beside compare, then rank's second table (readStandInGains)",
    },
    {
      found:
        "Each tower unrolled round its axis and traced into band tones, paint, raised faces, recesses at two depths, gilding and openings, on lathes standing on the walls, now carries the game's gold bands, the lantern tower's windows and the fluting where the exports do, by eye. Against the exports it scores a little worse than the bare lathes on most frames (night 0.077 to 0.085) and the day's better (0.140 to 0.128); a blurred difference over the near towers falls from 19.0 to 17.7. The gilding as metal read darker still at every hour, with nothing reflecting the sky into it, and three's bump map over the atlas changed no frame, so both are dropped",
      search:
        "genshin:assets fit login with fitLoginTowerFacades, then rank's second table at every hour with the paint, the recesses, the metal and the bump each left out in turn, and the outer lathes put back",
    },
    {
      found:
        "Our clouds were cut-outs with a dark rim, their crown's colour read where its blur and the outline's both thinned at the edge. Read as the crown's share of the cloud's own cover, the outline blurred to a fiftieth of a cell and the crown wider, edge sharpness falls toward the recordings' and FLIP moves under 0.002 at every hour. The statistics read our clouds dimmer over their sky than the recordings' and covering less of it; their cloud mask still takes the sky's own gradient for cloud",
      search: "genshin:parity clouds (measureClouds, readCloudStatistics) at every hour, before and after each blur",
    },
    {
      found:
        "Against the exports, the towers' multi-scale structural similarity reads 0.70 on the phone's door frame, 0.60 at dawn, 0.70 by day and 0.71 at night; the walkway's 0.61, 0.45, 0.86 and 0.48, its far end standing at full height in the exports where ours assembles; the bridges' over 0.8 everywhere. Side by side, the near lantern tower's arched windows read dark in the exports and pale orange in ours, but every darker recess (0.8 to 0.6 a unit of depth in place of 0.9) scored the towers worse by both measures",
      search:
        "rank's second table with scoreLabelSimilarity at every hour, its stand-in sheet read by eye, then the recesses' occlusion swept",
    },
    {
      found:
        "Each tower's walls read row by row, a moulding standing out all round lifting its band's wall, simplified within a quarter unit into sloped frustums and drawn with its turns under 50 degrees rounded by their normals: the towers' similarity fell from 0.678 to 0.669 over the four hours and their FLIP rose from 0.262 to 0.266, the near lantern tower's crown reading as stacked rings where the exports' carve capitals and arches. Reverted; read by row alone, a window band's median sank the lathe into its windows and lost them",
      search:
        "fitLoginTowerFacades with a per-row wall profile and createLatheStackGeometry with crease-angle normals, then rank's second table at every hour",
    },
    {
      found:
        "Drawing each guess as the frame draws, haze, clouds and tone mapping with it, over the exports, and matching the medians of the faces facing up, toward the sun and from it, the sun's strength and the sky light's colour converge in a few steps (the cost falling to between a half and a fifth) and never run away, yet scored the dusk, the day, the night and the wiki's door frame worse with our parts and with the exports, the night by 0.02; only the dawn's witness frame improved, by 0.005. Freed to colour the sky light from above and below apart, the dawn's sun doubled and its ground light turned deep blue, scoring its witness frame worse. The faces' medians pay for the haze's colour and depth, so the light waits on the haze, and the solver was deleted",
      search:
        "A Levenberg–Marquardt solve of the sun's share and the sky light's per-channel share on rendered frames at every hour, applied and compared with and without the witness",
    },
    {
      found:
        "The cloud mask now fits each sky's clear sky as a smooth cubic surface sunk under its clouds (fitClearSky) over the luminance blurred past a recording's grain, which the night's compression noise had speckled with cloud. By height over the horizon, the recordings' skies hold 90 to 100% cloud within 8 degrees at every hour, the dusk's about 90% at every height and the dawn's a fifth above 25 degrees; ours, the middle band at 60 and the top at 36, held a third to a half of that, and the top band, standing 105 metres up, left 8 to 25 degrees bare. Each band's share an hour draws is solved on that cover by the simplex (genshin:parity cover) over 240 middle and 240 top clouds, the top from 60 metres up, to within 0.07 to 0.13 of the sky's cover at dawn, dusk and night and 0.25 by day: the dawn's frame scores 0.005 better, and the dusk's sky reads clouded whole as the recording's does, while a score comparing pixels charges every cloud off the recording's place, its FLIP rising 0.03 as its blurred tone fell 1.6 points. At the day's and the night's solved cover their frames scored 0.03 to 0.05 worse and the day's solved cloud colours worse again: their clouds read grey and dark where the recordings' are white and pale, so they keep their former cover",
      search:
        "genshin:parity clouds at every hour with the clear-sky fit and the cover by elevation, the band counts and heights raised, then cover at every hour and compare",
    },
    {
      found:
        "The exports' walkway now assembles as ours does in the stand-in table, each piece sunk by its middle's distance ahead with the seed of our piece standing where it does (sinkLoginWitnessWalkway), so its far end no longer stands built out to the horizon: the walkway's similarity rose from 0.48 to 0.56 at night. Side by side, our paving's dark lines were the rest of its gap: the exports' plan reads its pockets as stone about 0.83 of its lane with paler rims and no dark line, and every darkness of the brick joints and the pockets' rims drawn as lines scored the walkway worse. Filled pockets a twentieth darker than the lane and no lines take the walkway from 0.280 to 0.208 of FLIP and from 0.63 to 0.80 of similarity against the exports over the four hours, and every hour's frame but the day's, level, scores better",
      search:
        "rank's second table with the witness walkway sunk, then the paving's lines and pockets swept against the exports",
    },
    {
      found:
        "Against the exports, the towers' traced facade at its full contrast scored under the bare stone (FLIP 0.258 against 0.249, similarity 0.688 against 0.693 over the four hours); its shades drawn a quarter as far from the stone score best by both, 0.248 and 0.694, and every hour's frame scores better or level. Without the gilding alone the towers scored 0.251 and 0.691: the bright gold is a part of the gap, the painted relief the rest",
      search:
        "The facade's every shade scaled toward the stone by a contrast share swept from none to all, and the gilding left out, in rank's second table at every hour",
    },
    {
      found:
        "The towers' relief drawn as a height canvas of each layer's depth, blurred over two texels and lit through three's bump map, left the towers level against the exports at its own strength and worse at three times it: the relief the game lights is its geometry's, which a bump over a lathe does not stand in for. The door's painted relief at three fifths of its read contrast scores the door best against the exports on both door frames (FLIP 0.267 to 0.258, similarity 0.638 to 0.648), the recording's door frame a little better and the phone's 0.005 worse",
      search:
        "A bump map over a blurred height canvas of the facade's layers at strengths 0, 1 and 3, then the door relief's contrast swept from none to all, in rank's second table",
    },
    {
      found:
        "The dawn's sky solved over only the pixels the cloud mask reads clear (readCloudSky in place of the solve's own trim) reaches no pixel low over the horizon, all of it cloud and haze, so only its zenith colours are held; those alone scored the dawn worse (FLIP 0.501 to 0.506), and the solver keeps its own trim",
      search:
        "genshin:parity sky login-dawn-title over the clear sky the cloud mask leaves, its zenith colours applied, then compare",
    },
    {
      found:
        "AnimeStudio's parser refuses the stone's shader (miHoYo/Scene/Login Base) and the cloud layer's, and drops what it refuses from a raw export as well; the type filter Shader:Export writes them unparsed, and every one of the block's shaders reads like any other. The stone's programs only write the G-buffer: its normal from the normal map (a normal shorter than _FillNormalGaps flattened), its albedo as _Color by the diffuse texture less 0.96 of it by the mask's metal, its specular colour as 0.04 graded to the albedo by that metal with the mask's smoothness beside it, and the emission graded into _RGColor at _RGStrength by one less the facing ratio raised to _RGPower; where that glow reaches _EmissionRange the pixel is written as shading model 13, its glow in place of its specular colour. _SpecColor, _Shininess and _GlossMapScale are not read",
      search:
        "AnimeStudio's log over the stone's block, then its export with every type filter suffix it offers, then the stone's programs decompiled",
    },
    {
      found:
        "The deferred passes are Hidden/Internal-DeferredShading and Hidden/DeferredReflections in 00/00612967.blk, named by every block's shaders exported unparsed. The sun's pass lights a pixel as its diffuse colour by the sun's colour through a ramp (_DeferredToonRampTex) read at a half plus half the facing to the sun by the shadow raised to a fifth, plus the sky's spherical harmonics on the normal by the diffuse colour graded toward white by the occlusion, plus a GGX highlight of roughness squared smoothness, capped at 12, by a Schlick term with no visibility term; the diffuse colour itself grades toward the reflection cube by smoothness on upward faces. The environment is lit on a ramp after all, in the deferred pass rather than the material, which the light solve's model lacks. The ramp is in no asset of the index, so it is set at run time",
      search:
        "Every shader of every block in the asset index exported unparsed and named by its own string; the deferred shading shader's programs disassembled and decompiled, its sun pass read",
    },
    {
      found:
        "The witness drawn with the stone's rim glow as its program grades it scores the frames level or a little worse (the phone's door frame 0.466 to 0.468, the recording's door frame 0.606 to 0.612, the dawn level): the glow's pixels are shading model 13, which the deferred pass lights apart, and the witness lights it as any other. The rim stays, being the program's; the witness's light is the deferred pass's to replace",
      search:
        "compare --witness login on login-door, login-door-recording and login-dawn-title, the witness with and without the rim",
    },
    {
      found:
        "Solving the dusk's light and haze together on the door recording gives a sun 2.5 times as strong, a sky light a third as strong and a haze dense, dark away from the sun and bright toward it, which scores the recording 0.03 better and the dusk still 0.05 worse; drawn, both frames turn to a flat orange wall with the towers' silhouettes, where the references keep their towers lit and edged, so the bins' medians by depth, angle and facing still reward a haze that washes our towers to the frame's mean, our towers lacking the lit structure the references' carry",
      search:
        "The fog's density and colours solved with each light's share, ours drawn under the sun alone and the sky alone, the bins split by how their faces turn to the sun, on login-door-recording, then compare there and on the dusk still",
    },
    {
      found:
        "The bands' heights solved once for every hour, on the dawn's, the day's, the night's and the door recording's cover at once, each hour's shares solved again under them by turns: the cloud sea from 17.3 to 6.7 metres under the walkway, the middle cumulus from 23.6 under to 9.8 over and the top from 31.6 to 396.9 up, with a residual of 0.27 of the sky's cover over the four (night 0.09, dawn and dusk 0.29, day 0.35, our day's clouds reading clear at the recording's split under 8 degrees). With the dawn's and the dusk's solved shares the door recording's FLIP falls from 0.6006 to 0.5768 and its tone from 12.33% to 11.25%, the others within a thousandth; the day's and the night's solved shares scored their frames 0.010 and 0.017 worse and the wiki's door frame 0.022, so those two keep their former shares. The dusk still covers 8 to 15 degrees at 14% against the recording's 70%, so its colours wait on placement",
      search:
        "genshin:parity cover login-dawn-title,login-day-title,login-door-recording,login-night-title --witness login --heights, then compare --all with every hour's solved shares, then with the day's and the night's former shares",
    },
    {
      found:
        "Each hour's sky solved over its title frame's clear sky. The dawn's, residual 0.021 over its clear sky, draws 0.094 off its frame against 0.150 before and lowers its FLIP from 0.5012 to 0.4943, so it ships. The day's, residual 0.018, toward the sun a yellow green the frame barely shows, holds its own frame level and leaves the phone's door frame 0.4529 to 0.4628. The night's, residual 0.009 with a moon glow the sky state does not yet set, lowers the clear sky's ceilings and raises the frame from 0.4492 to 0.4627: our clouds' cover near the horizon is a fiftieth of the recording's, and the old brighter sky stood in for them. With the god rays' pass out of the chain every drawn sky but the day's lands nearer its solve (dawn 0.059, night 0.047), the pass mixing the sky toward its blanked colour by the lit air along each ray",
      search:
        "genshin:parity sky on login-dawn-title, login-day-title and login-night-title, each solve applied and compare run on every login frame, then sky's drawn line with the god rays' pass left out of createPostPipeline",
    },
    {
      found:
        "The night's cover solved alone under its solved sky fits worse than what ships (residual 0.218 of the sky's cover), its bands unable to stand clouds low on the horizon without standing more high over it; and clouds there reads a shade of #34012d over 386 of our pixels against 1973 of the recording's, too few to trust",
      search: "genshin:parity cover login-night-title, then clouds login-night-title, under the night's solved sky",
    },
    {
      found:
        "Over the parts' interior pixels the witness draws from the exports, the reference in scene colour against the exports' albedo, normal and depth: binned by depth, facing and how far a face turns up, the old sun and ambient leave 0.130 of the dawn's 0.164 spread and 0.192 of the door recording's 0.274, the deferred pass's ramp and sky harmonics 0.075 and 0.091. Pixel by pixel neither explains much (0.24 of 0.30 at dawn), so the exports' texels do not line up with the reference's and a light is read over bins",
      search:
        "A scratch solve of both light models over the dawn's and the door recording's witness pixels, per pixel and binned, under the scene's haze",
    },
    {
      found:
        "Solved against the exports as our own scene drew them under a light already written, the solve handed back a sky light 1.4 to 2 times too strong: the haze's blend weighs its own colour by one less its scatter, which the solve had not; the rim and glow the material adds after lighting had gone into the sky term; and the grade and bloom after the tone mapping bent every colour off what toSceneColor inverts. With each fixed, and the login drawn through the tone mapping alone, the read-back returns the light to within about a ninth, the rest the normal maps the G-buffer leaves out",
      search: "genshin:parity calibrate login-night-title --self, after each fix",
    },
    {
      found:
        "The haze's colours solved with the light over the stone scored the dawn 0.4938 to 0.5087 and the night 0.4523 to 0.4575, helping only the dusk (0.5682 to 0.5656): the haze's colour is the cloud sea's too, and over the stone alone it took up the light's errors. The light is solved under the scene's haze held as it is. Every hour's light so solved, with the day's and the night's skies, scores the dawn 0.4950, the day 0.4447, the night 0.4498, the door recording 0.5698 and the phone's door frame 0.4782, against 0.4943, 0.4874, 0.4492, 0.5767 and 0.4529 before",
      search:
        "genshin:parity calibrate on each hour's frame with --write, the haze's solved colours applied and reverted hour by hour, then compare on every login frame",
    },
    {
      found:
        "Held to rise, solved as non-negative rises by an active set, the ramp leaves the dawn, the day, the night and the phone's door frame level and scores the door recording 0.5824 against 0.5698. Refined by Nelder–Mead from the hand-set directions, every one judged over the bins the scene's own direction sorts the pixels into, the day's sun moved about five degrees for 0.00005 of a 0.106 residual and the dusk's about one and a half for a hundredth of it: the sky's linear harmonics take up the ramp's facing term, so the faces cannot read the direction. With the haze's sunward glow turned with the light, the dusk's sank below the horizon for a sixth of its residual; the glow solved alone, the light held, points behind the camera, its glow over the stone wanted gone where the cloud sea's is measured. The glow turned toward the dusk's sun rather than its light, the light re-solved, scored the door recording 0.5821 against 0.5824. All reverted",
      search:
        "genshin:parity calibrate on the day title and the door recording with the ramp held to rise and the sun's direction refined, the haze's glow turned with it, held, and solved alone, then compare on every login frame",
    },
    {
      found:
        "The sun's program is Shader#25's program 101 in the deferred block's export (login/shaders/00612967). It reads the shading model from the G-buffer's last target, smoothness from another, the specular colour from a third and the normal, albedo and occlusion, and lights a pixel as its albedo by the light's colour through a one-channel ramp at a half plus half its facing clamped at none, by the shadow raised to a fifth, plus the sky's harmonics (the second order's nine, floored at none) by the albedo graded toward white by the occlusion, plus min(12, D/π) by Schlick's F by the light's colour, the clamped facing and the shadow: D is GGX at a roughness of one less the smoothness, squared, and F grades the specular colour toward white by one less the light's dot with the half vector to the fifth, by twice one less the roughness squared. Shading model 13 takes 0.04 for its specular colour, the albedo's alpha for its smoothness, and adds the specular target's colour by twenty times the smoothness target squared as glow. The stone program writes 0.04 graded to the albedo by its mask's metal as the specular colour, so the stone's highlight is a dielectric's, about a tenth of the lit stone's colour at its peak; the fitted stone's smoothness is scaled by _GlossMapScale and its specular colour is _SpecColor, neither of which the program reads. The reflection pass (Shader#13) adds the light probes' clustered ambient and the reflection cube, both set at run time",
      search:
        "The deferred block's shaders listed by their properties (_TOON_ON names Shader#25, _ProbeClusterCubeDefault Shader#13), the sun's program found by its highlight's cap, and both read",
    },
    {
      found:
        "The ramp's facing clamped at none as the pass clamps it, the ramp held from its shadowed middle, every hour re-solved: the binned residual reads lower (dawn 0.067 against 0.085), but only because every turned-away pixel falls into one ramp bin and the bins' spread falls with it; the frames score the dawn 0.5149 against 0.4950, the night 0.4676 against 0.4498, the door recording 0.5761 against 0.5698, the day and the phone's door frame level. Under rank the dawn's middle towers turned away lose most (0.116 to 0.129): the unclamped ramp's lower half shapes turned-away faces by their facing, a curve the sky's second order harmonics cannot draw, standing in for light the model lacks, the reflection pass's probes first. --self leaves 0.012 of residual, so the model draws what the renderer draws. Reverted",
      search:
        "genshin:parity calibrate on every hour with the facing clamped, --write, then compare on every login frame, rank on the dawn title and calibrate --self",
    },
    {
      found:
        "The silhouettes' term was the error either side of them: a silhouette pixel's error averages 0.51 at dawn, the turned-away middle towers' 0.53. Split into the exports' mean error over the pixels within four of it off every silhouette and the excess over that, placement and pose read 0.0034 at dawn, 0.0035 by day and 0.0043 on the door recording, where the whole term read 0.074 to 0.107, so a part a pixel or two off is no longer the largest term. A part a dozen pixels off is charged to the light rows over its area: overlay shows the dawn's left tower standing out into the sky past the recording's",
      search:
        "rank on the dawn title, the day title and the door recording with the silhouettes' error split, then overlay on the dawn and the day",
    },
    {
      found:
        "A mask of the reference's sky by its colour and its grain over five pixels, learnt from the pixels at least six from our own parts' outline, reads the dawn's cloud sea and haze as stone, the two sharing colour and grain (IoU 0.65 with ours). On the door recording its upper sky holds: the middle towers stand a few to fifteen pixels off the recording's each, in no one direction, so each tower's place is off rather than the row's or the pose. Not kept, the cloud sea leaving it no measure to solve on",
      search:
        "A scratch mask of each reference's sky, a colour and contrast histogram learnt off our own layout, read per part against the witness's part target on the dawn title and the door recording",
    },
    {
      found:
        "The exports' dawn frame corrected to the recording's own colour, channel by channel, over every part pixel of a bin and scored again: by rank's bins it falls 0.002, by depth in eight bands, facing in six and how far a face turns up in three 0.010, by each part and its facing 0.016, but the same bins split by twelve rows 0.062 and a smooth field over four pixels 0.127; the albedo's tone split nothing more and the columns 0.017. So no light over depth and facing, the reflection pass's probes, the clamp and the highlight among them, could buy over a hundredth there: the light rows' error varies with the row",
      search:
        "A scratch oracle over the exports' frame of login-dawn-title, each binning's per-channel gain applied and FLIP scored again, promoted as rank's third table (readLightCeilings)",
    },
    {
      found:
        "By depth and world height over the walls alone, the recordings' stone is bright below the walkway and dark above it at every hour, where ours stands level: at 20 to 40 metres out the dawn's 0.63 against our 0.40 under the walkway and 0.22 against 0.36 over it, the night's 0.35 against 0.19 and 0.04 against 0.17, the dusk's 0.43 against 0.32 and 0.16 against 0.31. The haze's falloff was set by hand and the fog solve binned by depth and angle alone, so the light solved over bins spanning heights stood too dark below and too bright above",
      search:
        "A scratch table of each frame's linear luminance and ours, by depth band and the world height the witness's depth gives, over the walls (a normal within 0.3 of level) at every hour",
    },
    {
      found:
        "calibrate's bins split by height, the haze's density and falloff refined by the simplex with the light, its colours held: the dawn solves to a density of 1.60 at the cloud sea's top falling 0.254 a metre (residual 0.120 against 0.160 under the scene's), the night to 3.40 and 0.297 (0.146 against 0.196), the dusk to 0.26 and 0.167 (0.152 against 0.168), the day to 0.081 and 0.079 from either start (0.169 against 0.171). Each written with its light, the dawn scores 0.3890 against 0.4382, the night 0.4003 against 0.4452 and the door recording 0.5255 against 0.5361; the day's scored its title 0.4402 and the phone's door frame 0.4867 against 0.4397 and 0.4791, and its light alone re-solved under its old haze 0.4418 and 0.4819, so the day keeps both. The dense haze drowns the cloud sea into one pale sheet where the recordings show its billows",
      search:
        "genshin:parity calibrate --haze on every hour's frame, each profile set in LoginSkyStateMap and its light written, then compare --all; the day's light re-solved alone under its old haze",
    },
    {
      found:
        "The cloud sea drawn clear of the dense haze, its billows unpaled, scored the dawn 0.4360 against 0.3890 and the night 0.4378 against 0.4003: the haze's pale sheet stands nearer the recordings than our billows, so where the game's sea stands, not whether the haze covers it, is the unknown. Reverted",
      search:
        "The cloud sea's material writing no depth, so the haze pass leaves it, then compare on the dawn and the night",
    },
    {
      found:
        "Eff_SeaOfCloud_Login hangs at the origin's CloudEffect anchor 67.5 back, its three emitters empty anchors with particle systems: Cloud_Back 14 metres under the walkway and 27 further back, Cloud_Back02 and Cloud_Back03 1.7 under, some 215 to either side. Our sea moved from 20 metres under to Cloud_Back's 14, each hour's haze density rescaled so its profile stands as it was, scores the dawn 0.3888, the day 0.4396, the night 0.4003, the door recording 0.5246 and the phone's door frame 0.4789, level or better on every frame",
      search:
        "genshin:assets tree login --root LoginScene, then --root Eff_SeaOfCloud_Login, then the sea plane at Cloud_Back's height and compare on every login frame",
    },
    {
      found:
        "Each height band's linear luminance over the parts, the recording's against the exports' as our scene draws them, by depth: beyond 80 metres ours stands too bright at every height and every hour, by a fifth at dawn, a quarter at dusk and up to two and a half times at night, and further off the deeper the stone lies, so the haze hides too much of the far stone; over the walkway, from 20 metres out, ours stands about an eighth too bright at every depth, a light that dims with height; under the walkway at 20 to 80 metres the two agree",
      search:
        "rank on the dawn title, the night title and the door recording, its height bands by depth (readLightCeilings)",
    },
    {
      found:
        "A light from the cloud sea, each pixel's albedo by a colour fading exponentially with its height over the sea, solved with the light and the haze over the dawn's bins: residual 0.1114 against 0.1203, with its falloff at 0.06 a metre, but only by emptying the haze to a density of 0.028, the light standing in for it, so the cloud sea's pale sheet, which the frames need, would go. Not built",
      search:
        "A scratch term in solveStoneLight, its falloff refined with the haze by calibrate --haze on the dawn title",
    },
    {
      found:
        "The haze held under a most opacity, refined with its density and falloff: the dawn solves to 0.67 (residual 0.1102 against 0.1203) and scores 0.3935 against 0.3888, its towers 0.1767 against 0.1756 and its sky 0.1448 against 0.1402 by layer, its cloud sea paling less; the night solves to 0.65, a density of 12.6 falling 0.46 a metre (0.1127 against 0.1455), and scores 0.3756 against 0.4003; the dusk to 0.77, 0.37 falling 0.21 (0.1480 against 0.1517), and scores 0.5197 against 0.5246; the day to 0.74, 5.46 falling 0.25 (0.1555 against 0.1708), and scores its title 0.4342 against 0.4396 but the phone's door frame 0.5026 against 0.4789. The night's and the dusk's ship with their lights; the dawn and the day keep theirs",
      search:
        "maxOpacity on FogUniforms and SceneFog, refined by calibrate --haze on every hour's frame, each profile set in LoginSkyStateMap and its light written by calibrate --write under it, then compare on each hour's frames, compare --witness on the dawn by layer, and compare --all",
    },
    {
      found:
        "Under the night's shipped haze held, a light by the albedo fading with height over the cloud sea leaves a residual of 0.1058 at a falloff of 0.02 a metre, 0.1064 at 0.05, 0.1099 at 0.1 and 0.1124 at 0.4, against 0.1127 without it: what is left with height is a gentle gradient over tens of metres, as clustered probes stepping up the towers would cast it, not a glow off the sea near its top",
      search: "A scratch term in solveStoneLight at fixed falloffs, the haze held, by calibrate on the night title",
    },
    {
      found:
        "The same light at the dawn leaves a residual of 0.1172 at 0.02 a metre, 0.1171 at 0.05 and 0.1174 at 0.1 against 0.1203, and at the dusk 0.1451, 0.1447 and 0.1465 against 0.1480, so every hour reads best near 0.05. Built into the stone's light at that falloff (STONE_HEIGHT_FALLOFF), solved per hour with the ramp and the harmonics and written, it scores the dawn 0.3856 against 0.3889, the day's title 0.4369 against 0.4396 and the phone's door frame 0.4721 against 0.4788, the door recording 0.5165 against 0.5197 and the night 0.3674 against 0.3756. Its colour differs by hour, the dawn's and the day's near grey, the night's blue with its red below none and the dusk's red with its blue below none, so it carries more than the probes' light",
      search:
        "A scratch term in solveStoneLight at falloffs of 0.02, 0.05 and 0.1, the haze held, by calibrate on the dawn title and the door recording; then heightFade on StoneLight, written by calibrate --write at every hour and compared on each hour's frames and compare --all",
    },
    {
      found:
        "A light varying across the scene, the albedo by its sideways and its forward distance from the eye, solved with the light over bins split sideways as well: the dawn's residual 0.1292 to 0.1279 and the day's 0.1786 to 0.1753, a hundredth to two. Not built",
      search:
        "Scratch terms in solveStoneLight with the bins split by sideways distance, by calibrate on the dawn and the day titles",
    },
    {
      found:
        "The night's ramp runs under none in blue across its middle knots and its harmonics swing to minus two to four on the normals the camera never sees, so the night's far towers draw orange-brown. Held at none or above, every knot, the fade and the sky's light on 64 directions over the sphere, the night scores 0.3805 against 0.3674 and the dawn 0.3977 against 0.3856: the negative light is cancelling a haze too bright over the far stone, so it stays",
      search:
        "An active set over solveStoneLight's knots, fade and harmonics at 64 directions, by calibrate --write and compare on the night and the dawn",
    },
    {
      found:
        "The night's clouds stand 2.41 times their sky's brightness against the recording's 5.54, mostly at their shade colour; that shade raised halfway to the lit one stands them at 3.10 and scores the night 0.3735 against 0.3674, their spread falling from 0.85 to 0.52, since brighter clouds where the recording has none cost more than the ratio gains. Kept",
      search: "genshin:parity clouds on the night title, the shade raised to #3d85d8, then clouds and compare",
    },
    {
      found:
        "Screen-space occlusion over the frame's depth, without the light solved under it, scores the night 0.3605 to 0.3609 at 4, 8 and 16 metres against 0.3674, the dawn and the door recording within a thousandth either way, and the day's title and the phone's door frame worse. Solved under it through the witness's occlusion target at 8 metres, the night scores 0.3649, the door recording 0.5141 against 0.5165, the day's title 0.4373 against 0.4369 and the dawn 0.3864 against 0.3856; at 4 metres the dawn 0.3877 and the day 0.4383. The phone's door frame drawn with none, under the day's light solved with it, scores 0.4667, and at a phone's tier 0.4685, against 0.4721. The day, the dusk and the night ship it at 8 metres and the phone's frame draws none; the dawn draws none",
      search:
        "GTAONode in createPostPipeline at 4, 8 and 16 metres with compare on every frame, then createOcclusionNode with the witness's occlusion target, calibrate --write at every hour and compare at 8 and 4 metres, then the phone's frame at the medium tier",
    },
    {
      found:
        "The day's haze solved again under its occlusion, with the phone's door frame at a phone's tier: a density of 0.204 falling 0.125 a metre with no most opacity (residual 0.1677 against 0.1712). Written with its light, the day's title scores 0.4305 against 0.4373 and the phone's door frame 0.4698 against 0.4685, so it ships",
      search:
        "calibrate --haze on the day title, the haze set in LoginSkyStateMap, calibrate --write, then compare on both day frames",
    },
    {
      found:
        "The door's mesh is one skinned mesh of two submeshes, welded into four pieces (the body, its two feet and the step under it), so its thirteen rising pieces are bones the export drops, and Ani_LogginScene_Door01_Liftting moves each from about 60 metres below into place. Its front stands at a dozen depths: the frame's face at 0.271 metres out with its feet's ornaments at 0.282 and the step at 0.258 and 0.261, a chamfer leaning at about 62 degrees from the face down to the opening at 0.134, and the panel's base at 0.071 under raised bands at 0.086, 0.094, 0.105 and 0.134, the 0.105 band bevelled at 35 degrees and the 0.134 one at 77. Built as those layers, each loop traced from the front's height on a half-centimetre grid with each corner leaning to the nearest point of the depth below where the cells between them slope, against the exports the door's FLIP falls from 0.361 to 0.324 and its similarity rises from 0.39 to 0.64 on the phone's door frame, and from 0.382 to 0.318 and 0.29 to 0.64 on the recording's. The phone's door frame scores 0.4675 against 0.4698, the chamfer worth 0.0022 of it, but the recording's 0.5157 against 0.5141: our dusk light lights the chamfer gold and the face dark where the recording's face reads a pale blue-grey and its chamfer dark, and the exports drawn under the same light do the same, scoring that frame 0.530 against ours 0.519. The painted relief's contrast at 0.3 or 1 and normals smoothed under 30 degrees each move both frames under a thousandth. Reverted: the carved door waits on the dusk light, the stone's haze and the sun's direction first",
      search:
        "The door's mesh split by connectivity and its faces binned by depth and tilt, the lift clip's curves by path, then the door fitted as layers (fit login --only door), rank's second table and compare on login-door and login-door-recording, with the chamfer drawn straight, the panel flat, the old relief and the relief's contrast swept",
    },
  ],
  open: [
    "Which object Ani_Login_Lift's animator is: its root's path hashes to the animator itself",
    "How the script brings the door from its anchor to the walkway: the place is measured (the door spawn's position), the motion is not",
    "Whether the towers' row tiles at its 200 metres: their fitted field spans about 300 along the glide",
    "The sky's own colours by day and at night, the dawn's and the dusk's being solved over their frames' clear sky (the dawn title's and the door recording's): the game's environment system sets its sky shader's _ES_ colours, top and bottom toward the sun and away, the halo, the sun's halo and the moon's glow, at run time from no asset the export holds, so they are measured; one frame's sky by least squares (genshin:parity sky) leaves its shape and its colours unsettled, the sun's direction itself measured and most of the sky under clouds and haze",
    "How the game brings the towers to the door's phase after a long idle: every recording found idles a few seconds, so the title's phase is read off its glide's length, not a rule of the script's",
    "What MonoBlockController does to each walkway piece: the rise is read by eye off the recording's far end; its raw bytes (genshin:assets behaviours login --script ^MonoBlockController$) hold its own curve",
    "Which of the towers' row stands at the door frame's left edge: the recording's is thin and dark with many rings, the exports' nearest there wide and arched",
    "The dusk sun's direction against its shadows: a tower's shadow falls over the wings in front of the door where the recording's are lit, and the faces' shading cannot settle the direction, the light's binned residual flat round the hand-set one, so the shadows' own edges are the measure left",
    "The dusk sky low on the frame's left: the recording's clear sky there is almost all cloud, so the sky solved over its clear pixels draws a dusty rose band where the recording glows gold, and its bottom colour toward the sun is held by no pixel",
    "The towers' gilding and windows: their colour per section scores worse painted as diffuse stone, the game's gold being a metal",
    "What the day's and the dusk's falling ramps stand in for: not the sun's direction, and holding them to rise scores the dusk worse, so the highlight, the reflection and the normal maps the solve lacks first",
    "The reflection pass's light probes and cube, set at run time, which the unclamped ramp's lower half stands in for on turned-away faces until they are modelled; the highlight, a dielectric's, waits behind them, and its stone smoothness is to be fitted without _GlossMapScale",
    "How the deferred pass lights shading model 13, the rim glow's pixels, and what the post pass's haze adds after it",
    "Where the glide comes to rest: the recording's door frame was still slowing at 1.6 metres a second when the click came, so the rest stands a little nearer the door than its pose",
  ],
  sources: {
    atmosphereShader: {
      block: "00/12903389.blk",
      kind: GameSourceKind.Shader,
      name: "Shader#0",
      pathId: "-5017021742717319217",
      role: "The sky dome: its gradient, top and bottom colours front and back of the sun, halos, stars and scattering, ported to createSkyNode from its decompiled vertex and pixel programs",
    },
    cloudLayerShader: {
      block: "00/12903389.blk",
      kind: GameSourceKind.Shader,
      name: "Enviro_Cloud_Layer_Mat's shader",
      pathId: "5100823853164162496",
      role: "The cloud layer",
    },
    cloudParticleShader: {
      block: "00/12903389.blk",
      kind: GameSourceKind.Shader,
      name: "Shader#10",
      pathId: "7325196393018652092",
      role: "The three cloud emitters' particles: atlas, curl, age dissolve, light and dark colours, rim",
    },
    dawnTitle: {
      block: "yt-sQNqMfmfkZU.mp4 at 18 s (login-dawn-title)",
      kind: GameSourceKind.Capture,
      name: "Genshin Impact - Login Background. Morning. [noOST], a 2023 PC recording idling on the title with no interface",
      role: "The dawn sky over the title, at the camera the door recording solves",
    },
    dayTitle: {
      block: "yt-7kK6HqVfASk.mp4 at 8 s (login-day-title)",
      kind: GameSourceKind.Capture,
      name: "Starting Celestia Door (Day), a 2022 PC recording idling on the title with no interface, its top and bottom 50 rows masked",
      role: "The day sky over the title, at the camera the door recording solves",
    },
    deferredShadingShader: {
      block: "00/00612967.blk",
      kind: GameSourceKind.Shader,
      name: "Hidden/Internal-DeferredShading",
      role: "The deferred lighting every stone's G-buffer is lit by: the sun through the toon ramp, the sky's spherical harmonics, the reflection cube and a GGX highlight, exported unparsed (Shader:Export)",
    },
    door: {
      block: "00/04803507.blk",
      kind: GameSourceKind.Transform,
      name: "LoginScene_Door01_Vo",
      role: "The door, under the stage at 0.4 scale, 32 metres along its axis",
    },
    doorCapture: {
      block: "login-door",
      kind: GameSourceKind.Capture,
      name: "File:Login Menu Door and Platform.png",
      role: "The flight's last pose: the door on its dais filling most of the frame",
    },
    doorRecording: {
      block: "yt-rBnfA4pXw6U.mp4 at 14 s (login-door-recording)",
      kind: GameSourceKind.Capture,
      name: "The English recording's last pose of the current build",
      role: "The flight's last pose at 16:9, with the door's and the walkway's widths the arrangement is checked by",
    },
    doorRise: {
      block: "00/16000354.blk",
      kind: GameSourceKind.AnimationClip,
      name: "Ani_LogginScene_Door01_Liftting",
      role: "The door assembling itself at the flight's end, its pieces rising into place over 1.33 s",
    },
    flight: {
      block: "00/16000354.blk",
      kind: GameSourceKind.MonoBehaviour,
      name: "MonoLoginScene",
      role: "The flight down the walkway: fieldless, so its path is solved from the captures",
    },
    gradingTables: {
      block: "00/00035183.blk",
      kind: GameSourceKind.Texture,
      name: "Stages_*_LUT",
      role: "The game's grading tables; which one the login uses is its fieldless post-processing profile's",
    },
    lift: {
      block: "00/16000354.blk",
      kind: GameSourceKind.AnimationClip,
      name: "Ani_Login_Lift",
      role: "One root lifted 50 metres over a second at the login's end, between the Start and End clips",
    },
    loginScene: {
      block: "00/11790361.blk",
      kind: GameSourceKind.Transform,
      name: "LoginScene",
      role: "The login's own root: its walkway's and door's nodes at one scale, its camera, sun, moon and sky",
    },
    meshes: {
      block: "00/02842276.blk",
      kind: GameSourceKind.Mesh,
      name: "LoginScene_*",
      role: "The towers, bridges, pillars, walkway and door, and their Diffuse, Normal, SMBE and Height textures",
    },
    nightTitle: {
      block: "yt-PnqNza4qWzs.mp4 at 12 s (login-night-title)",
      kind: GameSourceKind.Capture,
      name: "Starting Celestia Door (Night), a 2022 PC recording idling on the title with no interface",
      role: "The night sky over the title, at the camera the door recording solves",
    },
    recording: {
      block: "yt-rBnfA4pXw6U.mp4",
      kind: GameSourceKind.Capture,
      name: "GENSHIN IMPACT | CELESTIA DOOR | LOADING SCREEN",
      role: "The whole flight at 1080 high, an older build: the walkway straight to the door, towers either side",
    },
    stage: {
      block: "00/04803507.blk",
      kind: GameSourceKind.Transform,
      name: "CharacterSelectSceneNew",
      role: "The login's arrangement of towers, bridges, pillars and door at 0.4 scale",
    },
    stoneShader: {
      block: "00/12903389.blk",
      kind: GameSourceKind.Shader,
      name: "LoginScene_* materials' shader",
      pathId: "-8796901447730824398",
      role: "The stone, miHoYo/Scene/Login Base: AnimeStudio's parser refuses it, so its programs come from its unparsed raw export (Shader:Export); its material's properties are a physically based set, specular and rim-lit with no outline, fitted per family (fitLoginStone) into createStoneMaterial",
    },
    uberShader: {
      block: "00/12903389.blk",
      kind: GameSourceKind.Shader,
      name: "Shader#82",
      role: "The frame after the scene: bloom, grading, distortion, and the final pass through a 3D table",
    },
    walkway: {
      block: "00/04803507.blk",
      kind: GameSourceKind.Transform,
      name: "LoginScene_Bridge01_Vo",
      role: "The walkway, 20 metres wide at its own scale, a root dumped at the origin: it hangs at the door's 0.4 scale, 8 metres wide",
    },
  },
};
