import { Application, Graphics } from 'pixi.js';
import { Dungeon } from '@prisma/client';
import { TileMap } from '@/types';

const tileSize = 32;

export function initGame(mount: HTMLDivElement|null, dungeon: Dungeon) {
  if (!mount) return null;
  if (!dungeon.tiles) return null;

  const tiles: TileMap = JSON.parse(dungeon.tiles);

  const app = new Application({
    width: tileSize * 9,
    height: tileSize * 9,
    background: 0xCCCCCC,
  });
  mount.replaceChildren(app.view as any);

  for (let y = 0; y < tiles.length; y += 1) {
    const row = tiles[y];
    for (let x = 0; x < row.length; x += 1) {
      if (row[x]) {
        const wall = new Graphics();
        wall.beginFill(0x000000);
        wall.drawRect(0, 0, tileSize, tileSize);
        wall.endFill();
        wall.x = tileSize * x;
        wall.y = tileSize * y;
        app.stage.addChild(wall);
      }
    }
  }

  const entry = new Graphics();
  entry.beginFill(0xBBBBBB);
  entry.drawRect(0, 0, tileSize, tileSize);
  entry.endFill();
  entry.x = tileSize * 4;
  entry.y = 0;
  app.stage.addChild(entry);

  const exit = new Graphics();
  exit.beginFill(0xDDDDDD);
  exit.drawRect(0, 0, tileSize, tileSize);
  exit.endFill();
  exit.x = tileSize * 4;
  exit.y = tileSize * 8;
  app.stage.addChild(exit);

  const player = new Graphics();
  player.beginFill(0xFF0000);
  player.drawRect(0, 0, tileSize - 12, tileSize - 12);
  player.endFill();
  player.x = tileSize * 4 + 6;
  player.y = 6;
  app.stage.addChild(player);

  const onKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'ArrowUp' || event.key === 'w') {
      move(player, player.x, player.y - tileSize, tiles);
    }

    if (event.key === 'ArrowDown' || event.key === 's') {
      move(player, player.x, player.y + tileSize, tiles);
    }

    if (event.key === 'ArrowLeft' || event.key === 'a') {
      move(player, player.x - tileSize, player.y, tiles);
    }

    if (event.key === 'ArrowRight' || event.key === 'd') {
      move(player, player.x + tileSize, player.y, tiles);
    }
  };

  window.addEventListener('keydown', onKeyUp);

  return {
    destroy: () => {
      window.removeEventListener('keydown', onKeyUp);
    },
  };
}

function move(player: Graphics, x: number, y: number, tiles: TileMap) {
  const tileX = Math.floor(x / tileSize);
  const tileY = Math.floor(y / tileSize);

  if (tileX >= 0 && tileX < 9 && tileY >= 0 && tileY < 9 && !tiles[tileY][tileX]) {
    player.x = x;
    player.y = y;
  }

  if (tileX === 4 && tileY === 8) {
    setTimeout(() => alert('you win!'), 100);
  }
}
