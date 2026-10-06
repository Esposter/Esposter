import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// The door: its clips, its rise and the click, and its shape as its mesh's layers
export const doorTopic: ReferenceTopic = {
  investigations: [
    {
      method: "genshin:assets clips login: what the scene's clips move",
      outcome: InvestigationOutcome.Found,
      result:
        "Ani_LogginScene_Door01_Liftting is the door assembling itself over 1.33 s at the flight's end, its pieces rising about 60 metres from below into place; Ani_Login_Lift raises its animator's root 50 metres over a second, easing in and overshooting to 52.5 before settling",
    },
    {
      method: "The recording's last second at 15 frames a second (13.6 s to 15.2 s)",
      outcome: InvestigationOutcome.Found,
      result:
        "The click lights the door from its middle while the camera pushes toward it, the door growing about 1.7 times in a third of a second and gathering speed, under the white",
    },
    {
      method: "genshin:parity frames yt-rBnfA4pXw6U at 2 a second over 0 to 15 seconds",
      outcome: InvestigationOutcome.Found,
      result:
        "The door rises at the walkway's far end as its last blocks settle, about 12 seconds in, nothing built past it, and the glide then brakes it to its pose",
    },
    {
      method:
        "The door's mesh split by connectivity and its faces binned by depth and tilt, the lift clip's curves by path, then the door fitted as layers (fit login --only door), rank's second table and compare on login-door and login-door-recording, with the chamfer drawn straight, the panel flat, the old relief and the relief's contrast swept",
      outcome: InvestigationOutcome.Rejected,
      result:
        "The door's mesh is one skinned mesh of two submeshes, welded into four pieces (the body, its two feet and the step under it), so its thirteen rising pieces are bones the export drops, and Ani_LogginScene_Door01_Liftting moves each from about 60 metres below into place. Its front stands at a dozen depths: the frame's face at 0.271 metres out with its feet's ornaments at 0.282 and the step at 0.258 and 0.261, a chamfer leaning at about 62 degrees from the face down to the opening at 0.134, and the panel's base at 0.071 under raised bands at 0.086, 0.094, 0.105 and 0.134, the 0.105 band bevelled at 35 degrees and the 0.134 one at 77. Built as those layers, each loop traced from the front's height on a half-centimetre grid with each corner leaning to the nearest point of the depth below where the cells between them slope, against the exports the door's FLIP falls from 0.361 to 0.324 and its similarity rises from 0.39 to 0.64 on the phone's door frame, and from 0.382 to 0.318 and 0.29 to 0.64 on the recording's. The phone's door frame scores 0.4675 against 0.4698, the chamfer worth 0.0022 of it, but the recording's 0.5157 against 0.5141: our dusk light lights the chamfer gold and the face dark where the recording's face reads a pale blue-grey and its chamfer dark, and the exports drawn under the same light do the same, scoring that frame 0.530 against ours 0.519. The painted relief's contrast at 0.3 or 1 and normals smoothed under 30 degrees each move both frames under a thousandth. Reverted: the carved door waits on the dusk light, the stone's haze and the sun's direction first",
    },
    {
      method:
        "The door's and the walkway's saved layer patches applied in turn under the shipped light, the walkway refitted by genshin:assets fit login --only walkway, and compare on every frame each shows",
      outcome: InvestigationOutcome.Rejected,
      result:
        "Under the stone's own haze the door built as its mesh's layers still splits its two frames: the phone's door frame 0.4667 to 0.4647, the door recording 0.5126 to 0.5140, the dusk's loss a third of what it was under the old light. The walkway drawn with its curbs and its lanes' borders as levels of their own scores level or worse at every hour (the dawn title 0.3805 to 0.3813, the phone's door frame 0.4667 to 0.4673, the night title 0.3654 to 0.3659, the day title and the door recording within a ten-thousandth), so the light was not what cost it",
    },
    {
      method: "rank login-door-recording and login-door --witness login with and without the door's layer patch",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The game's own door drawn through our light scores worse than our flat door on both door frames (rank's Door: stand-in at -0.0045 on the door recording and -0.0022 on the phone's door frame), so the frames' FLIP cannot judge the door's shape while its light is off. By rank's second table the layers bring the door near its exports: similarity 0.30 to 0.67 and its gap 0.3718 to 0.3105 on the door recording, 0.55 to 0.72 and 0.2854 to 0.2590 on the phone's door frame. Shipped on that measure",
    },
    {
      method:
        "The door's mesh exported as JSON beside its OBJ (AnimeStudio --export_type JSON), its skin, bind poses and bone hashes read, genshin:assets tree login --root LoginScene_Door01_Vo, and the lift clip's curves matched to the bones by their paths' CRC32",
      outcome: InvestigationOutcome.Found,
      result:
        "The OBJ drops the skin, the JSON keeps it: every vertex follows one bone alone, so the door is thirteen rigid pieces, Point_Doorframe_01 to 07 under Point_001 for the frame and Point_Door_01 to 06 under Controller_L and Controller_R for the panel's two leaves, the bones' hashes those paths'. The clip moves each from 50 to 65 of the mesh's units below, 5 to 6.5 metres at the scene's tenth, and up to 4 metres toward the camera, turning as it rises, the first settled after 0.4 seconds and the frame's head last at 1.33; its fourteenth path, Root, moves no bone. Its last sample stands each piece where the mesh binds it",
    },
    {
      method:
        "The door fitted as its pieces (fitRigidPieces, fit login --only door), each piece's layers fitted alone, then at its part's depths, then with its feet found over the whole front; raycast depth maps against the whole door's, and rank's second table on login-door-recording and login-door beside the whole door on a worktree of the head",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Fitted alone, a piece kept only the depths its own flat faces stand at, so the bands' 0.086 and 0.094 (on the bottom leaf pieces) and the step's 0.203 no longer stepped the slopes on the others, and a long side piece's chamfer contours, their corners all at its cut ends, leaned into the cut and stood straight: similarity 0.49 at dusk and 0.64 on the phone's door frame against the whole door's 0.667 and 0.722. At its part's depths with its feet found over the whole front the door at rest stands 0.7 millimetres from the whole door's on average and nearer its exports: similarity 0.689 at dusk and 0.743 on the phone's door frame, its gap 0.3031 and 0.2564 against 0.3104 and 0.2590. Shipped, rising piece by piece",
    },
  ],
  openQuestions: [
    "How the script brings the door from its anchor to the walkway: the place is measured (the door spawn's position), the motion is not",
  ],
};
