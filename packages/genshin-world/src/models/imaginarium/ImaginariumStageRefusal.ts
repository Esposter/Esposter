// A wiki enemy name a stage's join refused: the count of monsters whose English name it is, zero when none holds it and more
// Than one when several do, so the name's monster is never guessed
export interface ImaginariumStageRefusal {
  count: number;
  name: string;
}
