import * as PIXI from 'pixi.js';
import { Application, BaseTexture, Texture, Rectangle, Sprite } from 'pixi.js';
import { Dungeon } from '@prisma/client';
import { TileMap } from '@/types';

const tileSize = 8;
const scale = 4;

export function initGame(mount: HTMLDivElement|null, dungeon: Dungeon) {
  if (!mount) return null;
  if (!dungeon.tiles) return null;

  const tiles: TileMap = JSON.parse(dungeon.tiles);

  const app = new Application({
    width: (tileSize * 9 + 1) * scale,
    height: (tileSize * 9 + 1) * scale,
  });
  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
  app.stage.scale.set(scale);
  mount.replaceChildren(app.view as any);

  const spritesheet = BaseTexture.from('/sprites.png');
  const rockTexture   = getTexture(spritesheet,  2, 2);
  const wallTexture   = getTexture(spritesheet,  0, 2);
  const playerTexture = getTexture(spritesheet,  0, 3);
  const gemTexture    = getTexture(spritesheet, 21, 4);

  for (let y = 0; y < tiles.length; y += 1) {
    const row = tiles[y];
    for (let x = 0; x < row.length; x += 1) {
      if (row[x]) {
        const wall = Sprite.from(wallTexture);
        wall.tint = 0x505050;
        wall.x = tileSize * x;
        wall.y = tileSize * y;
        app.stage.addChild(wall);
      }
    }
  }

  const exit = Sprite.from(gemTexture);
  exit.tint = 0xFF0000;
  exit.x = tileSize * 4;
  exit.y = tileSize * 8;
  app.stage.addChild(exit);

  const player = Sprite.from(playerTexture);
  player.x = tileSize * 4;
  player.y = 0
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

function move(player: Sprite, x: number, y: number, tiles: TileMap) {
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

function getTexture(spritesheet: BaseTexture, x: number, y: number): Texture {
  return new Texture(spritesheet, new Rectangle(tileSize * x, tileSize * y, tileSize, tileSize));
}
