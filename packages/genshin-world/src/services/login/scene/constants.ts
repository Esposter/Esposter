import scroll from "#src/data/login/scroll.json";
import walkway from "#src/data/login/walkway.json";
import { LOGIN_DOOR_POSITION } from "#src/services/login/door/constants";

// The camera holds one pose while the world glides toward it, in the scene's own units, SceneObj's tenth: turned as
// ModelCamera is, half a turn about an axis 0.0497 toward z, so it looks straight down the walkway's middle along +z
// Pitched 5.69 degrees up, under the vertical field of view of 51.2 the door frame's widths and the glide's frames
// Read. Held at that turn, login-door-recording's walkway and door silhouettes put the eye 1.22 metres over the
// Walkway's top and 10.64 short of the door (Login/Scene/Camera.reference.ts)
const EYE_HEIGHT = 1.22;
export const LOGIN_DOOR_REST_DISTANCE = 10.64;
export const LOGIN_CAMERA_HEIGHT = walkway.top + EYE_HEIGHT;
export const LOGIN_CAMERA_Z = LOGIN_DOOR_POSITION[2] - LOGIN_DOOR_REST_DISTANCE;
export const LOGIN_CAMERA_YAW = Math.PI;
export const LOGIN_CAMERA_PITCH = (5.69 * Math.PI) / 180;
export const LOGIN_CAMERA_FOV = 51.2;
export const LOGIN_CAMERA_FAR = 2000;
// The rows MonoLoginScene scrolls past the camera, each laid ahead of its own place and wrapped by its length: the
// Walkway's copies, its own length apart, and the towers' with their bridges and pillars
export const LOGIN_WALKWAY_ROW = scroll.LoginScene_Bridge01_Vo;
export const LOGIN_TOWERS_ROW = scroll.LoginScene_Build_All;
// How far every block of the walkway rises into place: Ani_Login_Lift, on each block's own animator, lifts it 50 units
// At the walkway's tenth, and nothing else of the scene rises with it
const WALKWAY_LIFT = 5;
// Where the towers' row, its bridges and pillars with it, stands off the place the blocks lay it, the camera held at
// The door frame's pose: the walkway's lift under it, so the colonnade behind the door lands on
// Login-door-recording's rows (genshin:parity view --offsets at 0, 5, 10 and 14) and the lantern tower's window band
// And gold rings on its own, and the deck of the bridge that crosses the glide's path passes under the walkway, as the
// Game's glide passes over it however long the title idles; 2.47 metres toward -x and 8.94 nearer, the lantern tower's
// Two edges land on the recording's (genshin:parity place --landmarks towerRightInner,towerRightOuter --axes x,z), the
// Crowned column behind the door within 20 pixels and the colonnade where it stood. Laid where the blocks lay it, the
// Glide drove into the bridge, and the lantern tower stood a ring too high and a third too narrow
export const LOGIN_TOWERS_ROW_OFFSET: [number, number, number] = [-2.47, -WALKWAY_LIFT, -8.94];
// The cloud sea's row, the sea of cloud effect's two copies 300 metres apart (MonoLoginScene's third record)
export const LOGIN_CLOUD_SEA_ROW = { count: 2, length: 300 };
// The glide, in metres a second off the English recording's paving at the camera's pose (genshin:parity glide): 3.14
// While the title waits, steady to a few hundredths over its clean frames, about 3.9 once the game prepares, changing
// Pace by 0.63 each second, the slope of the recording's last three seconds
export const LOGIN_GLIDE_TITLE_SPEED = 3.14;
export const LOGIN_GLIDE_PREPARING_SPEED = 3.9;
export const LOGIN_GLIDE_ACCELERATION = 0.63;
// Where the glide comes to rest at the door, as metres scrolled: nine of the walkway's copies, the towers' row 144
// Metres along its loop, as both door references place it (genshin:parity place, their towers and bridges moved as one
// With the camera held: 145.8 and 144.4 along, their other axes scattering either way). There the lantern tower stands
// Close to the door's right and the colonnade low behind it, as every recording's door frame shows them
export const LOGIN_GLIDE_DOOR_SCROLLED = 144;
// The moment of the loop the title opens at, as metres scrolled. Its walkway's phase is where the wiki's dawn still's
// First solve stood the walkway, 10.4 metres short of the middle of the copy ahead, a still of another camera; its
// Towers' is the English recording's glide from the title to the door's rest short of the door's, about 51 metres (2.4
// Seconds of title, the load's stall at the preparing pace, its measured 9 to 14 seconds and the braking after), since
// Recordings idle as long or not show the same door frame
const TITLE_WALKWAY_PHASE = 8.67;
const RECORDED_GLIDE_TO_DOOR = 51;
export const LOGIN_GLIDE_TITLE_SCROLLED =
  TITLE_WALKWAY_PHASE +
  LOGIN_WALKWAY_ROW.length *
    Math.round((LOGIN_GLIDE_DOOR_SCROLLED - RECORDED_GLIDE_TO_DOOR - TITLE_WALKWAY_PHASE) / LOGIN_WALKWAY_ROW.length);
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
export const LOGIN_CLOUD_COVERAGE = 0;
// The frames drawn before the scene is said to be ready: WebGPU compiles each pipeline on first use, so the first few
// Frames can come out before every material has. A scene mounted at the door is ready only once the door has risen
export const LOGIN_SCENE_READY_FRAME_COUNT = 10;
// The cloud sea's billows, as the noise's scale on the ground plane and where its lit tops start
export const LOGIN_CLOUD_SEA_SCALE = 0.048;
export const LOGIN_CLOUD_SEA_EDGE_START = 0.05;
export const LOGIN_CLOUD_SEA_EDGE_END = 0.35;
