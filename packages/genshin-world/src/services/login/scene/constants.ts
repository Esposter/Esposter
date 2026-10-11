// How far every block of the walkway rises into place: Ani_Login_Lift, on each block's own animator, lifts it 50 units
// At the walkway's tenth, and nothing else of the scene rises with it
const WALKWAY_LIFT = 5;
// ModelCamera's height over BridgeBeginNode, 60 units at SceneObj's tenth
const MODEL_CAMERA_HEIGHT = 6;
// The camera holds one pose while the world glides toward it, in the scene's own units, SceneObj's tenth: ModelCamera's
// Place and turn, half a turn about an axis 0.0497 toward z, so it looks straight down the walkway's middle along +z
// Pitched 5.69 degrees up, its eye ModelCamera's height over the walkway once the walkway has risen under it, under
// LoginCamera's vertical field of view of 45 from an 18.5:9 screen outward (`getLoginCameraFov`). The current build's
// Door frame at 21.5:9 puts the eye 0.997 metres over the walkway's top at 45 degrees; the design aspect is the one
// Whose width, held on the older build's 16:9 recording, gives the 51.2 its widths read. The door's rest is that
// Recording's, 10.64 metres short of the door (Login/Scene/Camera.reference.ts)
export const LOGIN_EYE_HEIGHT = MODEL_CAMERA_HEIGHT - WALKWAY_LIFT;
export const LOGIN_DOOR_REST_DISTANCE = 10.64;
export const LOGIN_CAMERA_YAW = Math.PI;
export const LOGIN_CAMERA_PITCH = (5.69 * Math.PI) / 180;
export const LOGIN_CAMERA_FOV = 45;
export const LOGIN_CAMERA_DESIGN_ASPECT = 18.5 / 9;
export const LOGIN_CAMERA_FAR = 2000;
// Where the towers' row, its bridges and pillars with it, stands off the place the blocks lay it: the walkway's lift
// Under it, since the row keeps its laid place while the walkway rises, so the deck of the bridge that crosses the
// Glide's path passes under the walkway as the game's does however long the title idles; and 8.94 metres nearer, the
// Row's phase along the glide at login-door-recording's door, which the title's moments are held against
export const LOGIN_TOWERS_ROW_OFFSET: [number, number, number] = [0, -WALKWAY_LIFT, -8.94];
// The cloud sea's row, the sea of cloud effect's two copies 300 metres apart (MonoLoginScene's third record)
export const LOGIN_CLOUD_SEA_ROW = { count: 2, length: 300 };
// The glide, in metres a second: MonoLoginScene's two speeds, 3.5 while the title waits and 4.5 once the game
// Prepares, which the current build's recording times by the walkway's repeats (genshin:parity glide) at 3.42 to 3.52
// And, over a repeat already braking, 4.35. It changes pace by 0.63 each second, the slope of the older recording's
// Last three seconds read off its paving, until the script's curves are named
export const LOGIN_GLIDE_TITLE_SPEED = 3.5;
export const LOGIN_GLIDE_PREPARING_SPEED = 4.5;
export const LOGIN_GLIDE_ACCELERATION = 0.63;
// Where the glide comes to rest at the door, as metres scrolled: nine of the walkway's copies, the towers' row 144
// Metres along its loop, where both older builds' door frames stand it, their towers and bridges moved as one with the
// Camera held: 145.8 and 144.4 along. There the lantern tower stands close to the door's right and the colonnade low
// Behind it; the current build's door frame stands the row elsewhere, so the phase follows how long the title idled
export const LOGIN_GLIDE_DOOR_SCROLLED = 144;
// The moment of the loop the title opens at (`computeLoginGlideTitleScrolled`). Its walkway's phase is where the
// Wiki's dawn still's first solve stood the walkway, 10.4 metres short of the middle of the copy ahead, a still of
// Another camera; its towers' is the English recording's glide from the title to the door's rest short of the door's,
// About 51 metres (2.4 seconds of title, the load's stall at the preparing pace, its measured 9 to 14 seconds and the
// Braking after), since recordings idle as long or not show the same door frame
export const LOGIN_GLIDE_TITLE_WALKWAY_PHASE = 8.67;
export const LOGIN_RECORDED_GLIDE_TO_DOOR = 51;
// The rush to the door on the click: the camera closes 41% of its distance to the door in its first 333 ms, gathering
// Speed with the square of the time, as the door grows about 1.7 times in the recording's last third of a second
// (Login/Scene/Index.reference.ts, source `recording`), and stops short of the door under the white
export const LOGIN_DOOR_RUSH_SHARE = 0.41;
export const LOGIN_DOOR_RUSH_MS = 333;
export const LOGIN_DOOR_RUSH_LIMIT = 0.9;
// The cloud sea's top, where the game's own sea stands (Eff_SeaOfCloud_Login's middle emitter, Cloud_Back, at the
// Login's CloudEffect anchor), and how far it reaches
export const LOGIN_CLOUD_SEA_HEIGHT = -14;
export const LOGIN_CLOUD_SEA_SIZE = 3000;
export const LOGIN_RIM_STRENGTH = 0.4;
export const LOGIN_FOG_START_DISTANCE = 10;
// The haze's light scattered toward the sun, which bathes the sunward side of the dawn's and the dusk's frames: how
// Narrowly it gathers round the sun and how strongly, measured off the references
export const LOGIN_FOG_SCATTER_POWER = 2;
export const LOGIN_FOG_SCATTER_STRENGTH = 1;
export const LOGIN_LIGHT_DISTANCE = 125;
// How far round each pixel in metres the screen-space occlusion reaches where an hour draws it, as the game's pass
// Darkens its stone's creases and the feet of its towers: set at run time from no asset, so it is the radius of 4, 8
// And 16 that scores the frames best, its light solved under it
export const LOGIN_OCCLUSION_RADIUS = 8;
// The light's shadow map: its size, the half width of the square it covers about the camera's view, and its biases
export const LOGIN_SHADOW_MAP_SIZE = 2048;
export const LOGIN_SHADOW_EXTENT = 50;
export const LOGIN_SHADOW_BIAS = -0.0005;
export const LOGIN_SHADOW_NORMAL_BIAS = 0.0125;
// The shadow's strength, the light's own at one. The night's moon is read through a deeper bias and a strength of 0.8:
// At the bias the other hours keep, the walkway's carved relief casts speckled shadow edges, 243 edge pixels where the
// Reference shows 99 (genshin:parity shadows login-door-session), and at these settings they read 107
export const LOGIN_SHADOW_INTENSITY = 1;
export const LOGIN_NIGHT_SHADOW_BIAS = -0.006;
export const LOGIN_NIGHT_SHADOW_INTENSITY = 0.8;
// The shadow's softness, the radius its percentage-closer filter samples each texel from: the light's own at one, and
// The night's moon over two texels, the radius whose shadow edges lie nearest the reference's (genshin:parity passes
// Login --pass Light), where four softens them further and reads farther from it
export const LOGIN_SHADOW_RADIUS = 1;
export const LOGIN_NIGHT_SHADOW_RADIUS = 2;
export const LOGIN_CLOUD_COVERAGE = 0;
// The frames drawn before the scene is said to be ready: WebGPU compiles each pipeline on first use, so the first few
// Frames can come out before every material has. A scene mounted at the door is ready only once the door has risen
export const LOGIN_SCENE_READY_FRAME_COUNT = 10;
// The cloud sea's billows, as the noise's scale on the ground plane and where its lit tops start
export const LOGIN_CLOUD_SEA_SCALE = 0.048;
export const LOGIN_CLOUD_SEA_EDGE_START = 0.05;
export const LOGIN_CLOUD_SEA_EDGE_END = 0.35;
