import { Dungeon } from '@prisma/client';

export class Routes {
  static editDungeon(dungeon: Dungeon): string {
    return `/edit/${dungeon.id}`;
  }
  
  static playDungeon(dungeon: Dungeon): string {
    return `/play/${dungeon.id}`;
  }
}
