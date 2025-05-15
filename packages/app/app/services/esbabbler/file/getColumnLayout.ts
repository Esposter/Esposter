export const getColumnLayout = (noFiles: number) => {
  switch (noFiles) {
    case 0:
      return [];
    case 1:
      return [12];
    case 2:
      return [6, 6];
    case 3:
      return [12, 6, 6];
    case 4:
      return [6, 6, 6, 6];
    case 5:
      return [6, 6, 4, 4, 4];
    default: {
      const columnLayout = Array(Math.floor(noFiles / 3) * 3).fill(4);
      if (noFiles % 3 === 1) columnLayout.unshift(12);
      else if (noFiles % 3 === 2) columnLayout.unshift(6, 6);
      return columnLayout;
    }
  }
};
