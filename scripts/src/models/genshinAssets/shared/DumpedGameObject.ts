export interface DumpedGameObject {
  m_Components: { m_PathID: string; Name: string }[];
  m_Name: string;
  m_Transform: { m_GameObject: { m_PathID: string } };
}
