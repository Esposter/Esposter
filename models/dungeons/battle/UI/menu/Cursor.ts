import { type Grid } from "@/models/dungeons/Grid";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { type Direction, type Position } from "grid-engine";
import { type GameObjects, type Scene } from "phaser";

export class Cursor<T extends string> {
  scene: Scene;
  positionMap: Position[][];
  phaserImageGameObject: GameObjects.Image;
  private grid: Grid<T>;

  constructor(scene: Scene, positionMap: Position[][], grid: Grid<T>) {
    this.scene = scene;
    this.positionMap = positionMap;
    this.grid = grid;

    const { x, y } = this.position;
    this.phaserImageGameObject = this.scene.add.image(x, y, TextureManagerKey.Cursor, 0).setOrigin(0.5).setScale(2.5);
  }

  get activeOption() {
    return this.grid.value;
  }

  get position() {
    return this.positionMap[this.gridPosition[1]][this.gridPosition[0]];
  }

  get gridPosition() {
    return this.grid.position;
  }

  set gridPosition(value: [number, number]) {
    this.grid.position = value;
    this.updateImagePosition();
  }

  moveGridPosition(input: Exclude<Direction, Direction.NONE>) {
    this.grid.move(input);
    this.updateImagePosition();
  }

  private updateImagePosition() {
    const { x, y } = this.position;
    this.phaserImageGameObject.setPosition(x, y);
  }
}
