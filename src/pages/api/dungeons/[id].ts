import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Dungeon } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    updateDungeon(req, res);
  } else {
    res.status(400);
  }
}

async function updateDungeon(req: NextApiRequest, res: NextApiResponse<Dungeon>) {
  const id = Number(req.query.id);
  const data = JSON.parse(req.body) as Dungeon;

  const db = new PrismaClient();
  const dungeon = await db.dungeon.update({ where: { id }, data });
  db.$disconnect();
  
  res
    .status(200)
    .json(dungeon);
}
