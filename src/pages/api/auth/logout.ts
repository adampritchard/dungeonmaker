import type { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/utils/session';
import { BasicApiRes } from '@/types';

async function logoutRoute(req: NextApiRequest, res: NextApiResponse<BasicApiRes>) {
  req.session.destroy();
  res.send({ ok: true });
}

export default withSessionRoute(logoutRoute);
