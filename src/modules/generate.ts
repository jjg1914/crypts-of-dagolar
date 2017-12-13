import { Stage } from "mu-engine";

export interface GenerateConfig {
  width: number;
  height: number;
  gridWidth: number;
  gridHeight: number;
  fill: number;
  maxDepth: number;
}

export interface DungeonNode {
  visited: boolean;
  x: number;
  y: number;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

export interface DungeonData {
  startX: number;
  startY: number;
  width: number;
  height: number;
  gridWidth: number;
  gridHeight: number;
  nodes: DungeonNode[][];
}

export function generateDungeon(config: GenerateConfig): DungeonData {
  const data = _initDungeonData(config.width, config.height);
  const sx = Math.floor(Math.random() * config.width);
  const sy = Math.floor(Math.random() * config.height);
  _fillDungeon(data, sx, sy, config.width, config.height, config.fill, config.maxDepth);

  return {
    startX: sx,
    startY: sy,
    gridWidth: config.gridWidth,
    gridHeight: config.gridHeight,
    width: config.width,
    height: config.height,
    nodes: data,
  };
}

export function stageForDungeon(data: DungeonData,
                                config: GenerateConfig)
: Stage {
  const stage = new Stage(config.width * config.gridWidth,
                          config.height * config.gridHeight,
                          "tileset.json");
  stage.prop("start", JSON.stringify({
    x: (data.startX * config.gridWidth + (config.gridWidth / 2 - 8)),
    y: (data.startY * config.gridHeight + (config.gridHeight / 2 - 8)),
  }));
  _paintDungeon(data.nodes, stage, config);

  return stage;
}

function _initDungeonData(width: number, height: number): DungeonNode[][] {
  const rval = [] as DungeonNode[][];

  for (let j = 0; j < height; ++j) {
    const tmp = [] as DungeonNode[];

    for (let i = 0; i < width; ++i) {
      tmp.push({
        visited: false,
        x: i,
        y: j,
        left: false,
        right: false,
        up: false,
        down: false,
      });
    }

    rval.push(tmp);
  }

  return rval;
}

function _fillDungeon(data: DungeonNode[][],
                      sx: number,
                      sy: number,
                      width: number,
                      height: number,
                      fill: number,
                      maxDepth: number)
: void {
  let visited = 0;

  (function _f(x: number, y: number, depth: number) {
    const src = data[y][x];
    src.visited = true;

    visited += 1;
    const tmp = [ "left", "right", "up", "down" ];
    const a = [];
    while (tmp.length > 0) {
      const i = Math.floor(Math.random() * tmp.length);
      a.push(tmp.splice(i, 1)[0]);
    }

    for (let e of a) {
      if (depth < maxDepth && visited < (width * height * fill)) {
        switch (e) {
          case "left":
            if (x > 0) {
              const dest = data[y][x - 1];
              if (!dest.visited) {
                src.left = true;
                dest.right = true;
                _f(x - 1, y, depth + 1);
              } else if (Math.random() < 0.2) {
                src.left = true;
                dest.right = true;
              }
            }

            break;
          case "right":
            if (x < width - 1) {
              const dest = data[y][x + 1];
              if (!dest.visited) {
                src.right = true;
                dest.left = true;
                _f(x + 1, y, depth + 1);
              } else if (Math.random() < 0.2) {
                src.right = true;
                dest.left = true;
              }
            }

            break;
          case "up":
            if (y > 0) {
              const dest = data[y - 1][x];
              if (!dest.visited) {
                src.up = true;
                dest.down = true;
                _f(x, y - 1, depth + 1);
              } else if (Math.random() < 0.2) {
                src.up = true;
                dest.down = true;
              }
            }

            break;
          case "down":
            if (y < height - 1) {
              const dest = data[y + 1][x];
              if (!dest.visited) {
                src.down = true;
                dest.up = true;
                _f(x, y + 1, depth + 1);
              } else if (Math.random() < 0.2) {
                src.down = true;
                dest.up = true;
              }
            }

            break;
        }
      }
    }
  })(sx, sy, 0);
}

function _paintDungeon(src: DungeonNode[][],
                       dest: Stage,
                       config: GenerateConfig)
: void {
  const tileWidth = config.gridWidth / 16;
  const tileHeight = config.gridHeight / 16;

  const floorLayer = {
    width: config.width * tileWidth,
    height: config.height * tileHeight,
    data: new Array(config.height * tileHeight) as number[][],
  }
  const wallLayer = {
    width: config.width * tileWidth,
    height: config.height * tileHeight,
    data: new Array(config.height * tileHeight) as number[][],
  }

  for (let i = 0; i < config.height * tileHeight; ++i) {
    floorLayer.data[i] = new Array(config.width * tileWidth);
    floorLayer.data[i].fill(0);
    wallLayer.data[i] = new Array(config.width * tileWidth);
    wallLayer.data[i].fill(0);
  }

  for (let f of src) {
    for (let e of f) {
      if (e.visited) {
        const offsetX = e.x * config.gridWidth;
        const offsetY = e.y * config.gridHeight;

        for (let j = 0; j < tileHeight; ++j) {
          for (let i = 0; i < tileWidth; ++i) {
            const r = Math.random();

            if (r < 0.1 && j > 0 && i > 0) {
              floorLayer.data[e.y * tileHeight + j][e.x * tileWidth + i] = 23;
              floorLayer.data[e.y * tileHeight + j][e.x * tileWidth + i - 1] = 22;
              floorLayer.data[e.y * tileHeight + j - 1][e.x * tileWidth + i] = 3;
              floorLayer.data[e.y * tileHeight + j - 1][e.x * tileWidth + i - 1] = 2;
            } else if (r < 0.20) {
              floorLayer.data[e.y * tileHeight + j][e.x * tileWidth + i] = 21;
            } else {
              floorLayer.data[e.y * tileHeight + j][e.x * tileWidth + i] = 1;
            }
          }
        }

        wallLayer.data[e.y * tileHeight][e.x * tileWidth] = 43;
        wallLayer.data[e.y * tileHeight][(e.x + 1) * tileWidth - 1] = 44;
        wallLayer.data[(e.y + 1) * tileHeight - 1][e.x * tileWidth] = 63;
        wallLayer.data[(e.y + 1) * tileHeight - 1][(e.x + 1) * tileWidth - 1] = 64;

        for (let i = 1; i < tileWidth - 1; ++i) {
          const mid = (tileWidth / 2) - 1;

          if (!e.up || (i !== mid && i !== mid + 1)) {
            wallLayer.data[e.y * tileHeight][e.x * tileWidth + i] = 41;
          }

          if (!e.down || (i !== mid && i !== mid + 1)) {
            wallLayer.data[(e.y + 1) * tileHeight - 1][e.x * tileWidth + i] = 61;
          }
        }

        for (let i = 1; i < tileHeight - 1; ++i) {
          const mid = (tileHeight / 2) - 1;

          if (!e.left || (i !== mid && i !== mid + 1)) {
            wallLayer.data[e.y * tileHeight + i][e.x * tileWidth] = 62;
          }

          if (!e.right || (i !== mid && i !== mid + 1)) {
            wallLayer.data[e.y * tileHeight + i][(e.x + 1) * tileWidth - 1] = 42;
          }
        }

        if (e.up) {
          _paintDungeonHorizontalDoor(dest, offsetX, offsetY, config);
        } else {
          _paintDungeonHorizontalWall(dest, offsetX, offsetY, config);
        }

        if (e.down) {
          _paintDungeonHorizontalDoor(dest, offsetX, offsetY + config.gridHeight - 16, config);
        } else {
          _paintDungeonHorizontalWall(dest, offsetX, offsetY + config.gridHeight - 16, config);
        }

        if (e.left) {
          _paintDungeonVerticalDoor(dest, offsetX, offsetY, config);
        } else {
          _paintDungeonVerticalWall(dest, offsetX, offsetY, config);
        }

        if (e.right) {
          _paintDungeonVerticalDoor(dest, offsetX + config.gridWidth - 16, offsetY, config);
        } else {
          _paintDungeonVerticalWall(dest, offsetX + config.gridWidth - 16, offsetY, config);
        }
      }
    }
  }

  dest.addLayer(floorLayer);
  dest.addLayer(wallLayer);
}

function _paintDungeonHorizontalWall(dest: Stage,
                                     x: number,
                                     y: number,
                                     config: GenerateConfig)
: void {
  _paintDungeonBlock(dest, x, y, config.gridWidth, 16);
}

function _paintDungeonHorizontalDoor(dest: Stage,
                                     x: number,
                                     y: number,
                                     config: GenerateConfig)
: void {
  const width = (config.gridWidth - (16 * 2)) / 2;
  _paintDungeonBlock(dest, x, y, width, 16);
  _paintDungeonBlock(dest, x + width + 32, y, width, 16);
}


function _paintDungeonVerticalWall(dest: Stage,
                                   x: number,
                                   y: number,
                                   config: GenerateConfig)
: void {
  _paintDungeonBlock(dest, x, y + 16, 16, config.gridHeight - (16 * 2));
}

function _paintDungeonVerticalDoor(dest: Stage,
                                   x: number,
                                   y: number,
                                   config: GenerateConfig)
: void {
  const height = (config.gridHeight - (16 * 4)) / 2;
  _paintDungeonBlock(dest, x, y + 16, 16, height);
  _paintDungeonBlock(dest, x, y + height + 48, 16, height);
}

function _paintDungeonBlock(dest: Stage,
                            x: number,
                            y: number,
                            width: number,
                            height: number)
: void {
  dest.addEntity({
    type: "block",
    components: {
      position: {
        x: { type: "value", value: x },
        y: { type: "value", value: y },
        width: { type: "value", value: width },
        height: { type: "value", value: height },
      }
    }
  });
}
