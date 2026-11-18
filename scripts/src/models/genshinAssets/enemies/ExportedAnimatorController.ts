// An Animator controller as AnimeStudio's JSON export writes it, as far as its states are read: the state machines'
// States with each one's blend tree nodes, the clip list those nodes index, and the names its state IDs resolve to
export interface ExportedAnimatorController {
  m_AnimationClips: { m_PathID: string }[];
  m_Controller?: {
    m_StateMachineArray: {
      m_StateConstantArray: { m_BlendTreeConstantArray: { m_NodeArray: { m_ClipID: number }[] }[]; m_NameID: number }[];
    }[];
  };
  m_TOS: Record<string, string>;
}
