import { Dungeon } from '@prisma/client';
import { encodeUid } from '@/utils/uids';

export class Api {
  static async createDungeon(): Promise<Dungeon> {
    const response = await fetch('/api/dungeons', { method: 'POST' });
    return response.json();
  }

  static async updateDungeon(id: number, data: Partial<Dungeon>): Promise<Dungeon> {
    const uid = encodeUid(id);
    const response = await fetch(`/api/dungeons/${uid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    return response.json();
  }
}
