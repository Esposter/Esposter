// One state of a monster's Animator controller: its name, and the path IDs of the clips its blend tree plays, one for
// Each weapon variant the tree holds, in the order the tree lists them
export interface ControllerState {
  clipPathIds: string[];
  name: string;
}
