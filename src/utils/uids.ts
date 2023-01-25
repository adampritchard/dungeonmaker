import HashIds from 'hashids';

type Kind = 'user' | 'dungeon';

export function encodeUid(kind: Kind, id: number): string {
  const hashIds = new HashIds(kind, 6);
  return hashIds.encode(id);
}

export function decodeUid(kind: Kind, uid: string): number {
  const hashIds = new HashIds(kind, 6);
  return hashIds.decode(uid)[0] as number;
}
