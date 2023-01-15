import HashIds from 'hashids';
const hashIds = new HashIds('', 6);

export function encodeUid(id: number): string {
  return hashIds.encode(id);
}

export function decodeUid(uid: string): number {
  return hashIds.decode(uid)[0] as number;
}
