export class Serializable {
  toJSON() {
    return JSON.stringify({ ...this });
  }
}
