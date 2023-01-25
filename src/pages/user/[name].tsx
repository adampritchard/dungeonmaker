import React from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import type { User, Dungeon } from '@prisma/client';
import { decodeUid } from '@/utils/uids';
import { Routes } from '@/utils/routes';
import { db } from '@/utils/db';

type Props = {
  user: {
    name: string;
    dungeons: Dungeon[];
  },
};

export default function PlayPage({ user }: Props) {
  return (
    <div>
      <h1>{user.name}&apos;s Dungeons</h1>

      <ul>
        {user.dungeons.map(dungeon =>
          <li key={dungeon.id}>
            <Link href={Routes.playDungeon(dungeon)}>
              {dungeon.name}
            </Link>
          </li>
        )}
      </ul>

      <div style={{ marginTop: 20 }}>
        <Link href="/">
          Home
        </Link>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const username = context.params?.name as string;

  const user = await db.user.findUnique({
    where: { name: username },
    select: { name: true, dungeons: true },
  });
  if (!user) return { notFound: true };

  return {
    props: {
      user,
    },
  };
};
