// The bits of a PMX bone's flags that decide which of its fields the file holds: a tail named by a bone rather than an
// Offset, an inverse kinematics chain, a rotation or a translation inherited from another bone, a fixed axis, local
// Axes, and an external parent
export enum PmxBoneFlag {
  IndexedTail = 0x1,
  InverseKinematics = 0x20,
  InheritRotation = 0x100,
  InheritTranslation = 0x200,
  FixedAxis = 0x400,
  LocalAxes = 0x800,
  ExternalParent = 0x2000,
}
