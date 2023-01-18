import { Dungeon, User } from '@prisma/client';
import { encodeUid } from '@/utils/uids';
import { SignupReqBody, LoginReqBody } from '@/types';

export class Api {
  static async createDungeon(): Promise<Dungeon> {
    return this.post('/api/dungeons', {});
  }

  static async updateDungeon(id: number, data: Partial<Dungeon>): Promise<Dungeon> {
    const uid = encodeUid(id);
    return this.put(`/api/dungeons/${uid}`, data);
  }

  static async signup(username: string, password: string) {
    const body: SignupReqBody = { username, password };
    return this.post('/api/auth/signup', body);
  }

  static async login(username: string, password: string) {
    const body: LoginReqBody = { username, password };
    return this.post('/api/auth/login', body);
  }

  static async logout() {
    return this.post('/api/auth/logout', {});
  }

  private static async post(endpoint: string, body: any) {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return response.json();
  }

  private static async put(endpoint: string, body: any) {
    const response = await fetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    return response.json();
  }
}
