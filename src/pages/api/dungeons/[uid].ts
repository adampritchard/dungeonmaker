import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Dungeon } from '@prisma/client';
import { decodeUid } from '@/utils/uids';
import { withSessionRoute } from '@/utils/session';
import { ApiError } from '@/types';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    updateDungeon(req, res);
  } else {
    res.status(400).send({ error: 'Bad Request' });
  }
}

async function updateDungeon(req: NextApiRequest, res: NextApiResponse<Dungeon|ApiError>) {
  if (!req.session.userId) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const id = decodeUid(req.query.uid as string);
  const data = JSON.parse(req.body) as Dungeon;

  const db = new PrismaClient();

  // Check that logged in user owns dungeon.
  const dungeon = await db.dungeon.findUnique({ where: { id } });
  if (req.session.userId !== dungeon?.authorId) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  
  const updatedDungeon = await db.dungeon.update({ where: { id }, data });
  db.$disconnect();
  
  res
    .status(200)
    .json(updatedDungeon);
}

export default withSessionRoute(handler);
