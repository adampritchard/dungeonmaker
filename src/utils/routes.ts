import type { Dungeon } from '@prisma/client';
import { encodeUid } from './uids';

export class Routes {
  static editDungeon(dungeon: Dungeon): string {
    const uid = encodeUid('dungeon', dungeon.id);
    return `/edit/${uid}`;
  }
  
  static playDungeon(dungeon: Dungeon): string {
    const uid = encodeUid('dungeon', dungeon.id);
    return `/play/${uid}`;
  }

  static userPage(user: { name: string }): string {
    return `/user/${user.name}`;
  }
}
