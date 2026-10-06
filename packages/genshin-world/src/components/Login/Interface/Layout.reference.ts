import type { ReferenceTopic } from "genshin-interface";

import { InvestigationOutcome } from "genshin-interface";

// Where the login interface's pieces stand: its block, its RectTransforms' tree and anchors, and the canvas
export const layoutTopic: ReferenceTopic = {
  investigations: [
    {
      method:
        "Which block holds the login interface, dumping the RectTransforms and GameObjects of 16000354, 11790361 and 03544574",
      outcome: InvestigationOutcome.Found,
      result:
        "In 11790361 (838 RectTransforms, with BtnHelp, BtnLogin, BtnRepair, BtnSetting and DoorNode); 16000354 holds 51 and 03544574 334, none of the page's: GameObjects are not in the asset index, so a block is found through an indexed asset beside them, the Ani_LoginMainPage_Waiting clips",
    },
    {
      method: "Where a RectTransform's anchors are",
      outcome: InvestigationOutcome.Found,
      result:
        "Its JSON export has the Transform fields alone; its raw export's last 40 bytes are the anchors, anchored position, size and pivot, and the raw and JSON files share their numbering",
    },
    {
      method: "How the page's tree is built from the dumps",
      outcome: InvestigationOutcome.Found,
      result:
        "A RectTransform's own path ID is not in its dump: it is its GameObject's first component, so the tree joins through the GameObjects",
    },
    {
      method: "The canvas's reference resolution",
      outcome: InvestigationOutcome.Found,
      result: "1600 by 900, drawn 1.2 times at 1080 high: the server bar's top is 128 plus 32 units up, 192 pixels",
    },
    {
      method: "The corner buttons' positions",
      outcome: InvestigationOutcome.Found,
      result: "Placed by a layout group at run time: their RectTransforms read zero, so their spacing is measured",
    },
    {
      method: "Why the footer rose on a narrow window",
      outcome: InvestigationOutcome.Adopted,
      result: "Anchored to the screen's foot, not its middle: the foot rides up a window narrower than 16:9 otherwise",
    },
    {
      method: "Where the loading row and the click-to-begin prompt sit in the tree",
      outcome: InvestigationOutcome.Found,
      result:
        "Bottom also holds LoadingDesc, the 58 unit loading row at its top; the prompt is BtnPressStart, a MonoUIContainer whose prefab loads at run time, so its band is measured: 38 units over the foot",
    },
    {
      method: "Why the build string disappeared",
      outcome: InvestigationOutcome.Adopted,
      result:
        "The build string's rect stretches across the account row with its pivot at the middle; placing it from the pivot's point on its whole length slid it half the row left, off the screen, and the backdrop compare drew the recording's own string over the gap",
    },
    {
      method: "Where BtnPressStart's prompt sits once the page is laid out from its tree",
      outcome: InvestigationOutcome.Adopted,
      result:
        "Its rect is a container the page loads the prompt's prefab into, under Center/SwitchServer, so the prompt fades with SwitchServer as the page enters; its own place is measured from that container's box",
    },
  ],
  openQuestions: [
    "The canvas's match between width and height on a window narrower than 16:9: the scaler is a script",
    "The layout groups' spacing, measured on the recordings",
  ],
};
