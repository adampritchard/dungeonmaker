import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Dungeon } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    createDungeon(req, res);
  } else {
    res.status(400);
  }
}

async function createDungeon(req: NextApiRequest, res: NextApiResponse<Dungeon>) {
  const db = new PrismaClient();
  const dungeon = await db.dungeon.create({data: {}});
  db.$disconnect();
  
  res
    .status(200)
    .json(dungeon);
}
