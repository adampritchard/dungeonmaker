import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { withSessionRoute } from '@/utils/session';
import { SignupReqBody } from '@/types';

async function signupRoute(req: NextApiRequest, res: NextApiResponse) {
  const data = JSON.parse(req.body) as SignupReqBody;

  if (data.username && data.password && data.password.length >= 8) {
    const db = new PrismaClient();

    const existingUser = await db.user.findUnique({
      where: { name: data.username },
    });

    if (!existingUser) {
      const user = await db.user.create({
        data: {
          name: data.username,
          password: bcrypt.hashSync(data.password),
        }
      });

      if (user) {
        req.session.userId = user.id;
        await req.session.save();

        db.$disconnect();
        
        return res
          .status(200)
          .json({ ok: true });
      }
    }
    
    db.$disconnect();
  }

  // TODO: return errors...

  return res.send({ ok: false });
}

export default withSessionRoute(signupRoute);
