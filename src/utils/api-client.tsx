import { Dungeon } from '@prisma/client';

export class Api {
  static async createDungeon(): Promise<Dungeon> {
    const response = await fetch('/api/dungeons', { method: 'POST' });
    return response.json();
  }

  static async updateDungeon(id: number, data: Partial<Dungeon>): Promise<Dungeon> {
    const response = await fetch(`/api/dungeons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    return response.json();
  }
}
