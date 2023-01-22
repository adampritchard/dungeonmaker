import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import type { Dungeon } from '@prisma/client';
import { withSessionRoute } from '@/utils/session';
import type { ApiError } from '@/types';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    createDungeon(req, res);
  } else {
    res.status(400).send({ error: 'Bad Request' });
  }
}

async function createDungeon(req: NextApiRequest, res: NextApiResponse<Dungeon|ApiError>) {
  if (!req.session.userId) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const db = new PrismaClient();
  const dungeon = await db.dungeon.create({
    data: {
      authorId: req.session.userId,
    },
  });
  db.$disconnect();
  
  res
    .status(200)
    .json(dungeon);
}

export default withSessionRoute(handler);
