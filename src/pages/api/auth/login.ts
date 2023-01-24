import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { withSessionRoute } from '@/utils/session';
import type { LoginReqBody, BasicApiRes } from '@/types';
import { db } from '@/utils/db';

async function loginRoute(req: NextApiRequest, res: NextApiResponse<BasicApiRes>) {
  const data = JSON.parse(req.body) as LoginReqBody;
  if (data.username && data.password) {
    const user = await db.user.findFirst({
      where: {
        name: data.username,
      }
    });

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
