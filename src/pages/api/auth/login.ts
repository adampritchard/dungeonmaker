import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { withSessionRoute } from '@/utils/session';
import { LoginReqBody, BasicApiRes } from '@/types';

async function loginRoute(req: NextApiRequest, res: NextApiResponse<BasicApiRes>) {
  const data = JSON.parse(req.body) as LoginReqBody;
  if (data.username && data.password) {
    const db = new PrismaClient();
    const user = await db.user.findFirst({
      where: {
        name: data.username,
      }
    });
    db.$disconnect();

    if (user && bcrypt.compareSync(data.password, user.password)) {
      req.session.userId = user.id;
      await req.session.save();
      
      return res
        .status(200)
        .json({ ok: true });
    }
  }

  return res
    .status(401)
    .json({ ok: false, error: 'invalid username or password' });
}

export default withSessionRoute(loginRoute);
