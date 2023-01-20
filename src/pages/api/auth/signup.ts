import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { withSessionRoute } from '@/utils/session';
import { SignupReqBody, BasicApiRes } from '@/types';

async function signupRoute(req: NextApiRequest, res: NextApiResponse<BasicApiRes>) {
  const data = JSON.parse(req.body) as SignupReqBody;

  if (!data.username) {
    return res.send({ ok: false, error: 'missing username' });
  }

  if (!data.password) {
    return res.send({ ok: false, error: 'missing password' });
  }

  if (data.password.length < 8) {
    return res.send({ ok: false, error: 'password must be 8 chars or longer' });
  }

  const db = new PrismaClient();

  const existingUser = await db.user.findUnique({
    where: { name: data.username },
  });

  if (existingUser) {
    res.send({ ok: false, error: 'username already taken' });
    db.$disconnect();
    return;
  }

  const user = await db.user.create({
    data: {
      name: data.username,
      password: bcrypt.hashSync(data.password),
    }
  });

  if (!user) {
    res.send({ ok: false, error: 'something went wrong' });
    db.$disconnect();
    return;
  }

  req.session.userId = user.id;
  await req.session.save();

  db.$disconnect();
  
  res.json({ ok: true });
}

export default withSessionRoute(signupRoute);
