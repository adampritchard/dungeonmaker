import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { withSessionRoute } from '@/utils/session';
import { db } from '@/utils/db';
import type { SignupReqBody, BasicApiRes } from '@/types';

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

  const existingUser = await db.user.findUnique({
    where: { name: data.username },
  });

  if (existingUser) {
    return res.send({ ok: false, error: 'username already taken' });
  }

  const user = await db.user.create({
    data: {
      name: data.username,
      password: bcrypt.hashSync(data.password),
    }
  });

  if (!user) {
    return res.send({ ok: false, error: 'something went wrong' });
  }

  req.session.userId = user.id;
  await req.session.save();
  
  res.json({ ok: true });
}

export default withSessionRoute(signupRoute);
