import React from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import type { Dungeon } from '@prisma/client';
import { decodeUid } from '@/utils/uids';
import { db } from '@/utils/db';
import { Routes } from '@/utils/routes';
import { Layout } from '@/components/Layout';
import { GameContainer } from '@/components/GameContainer';

type Props = {
  dungeon: Dungeon & {
    author: { name: string },
  },
};

export default function PlayPage({ dungeon }: Props) {
  return (
    <Layout pageTitle={dungeon.name}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ marginBottom: 0 }}>{dungeon.name}</h1>
        <div>
          by {' '}
          <Link href={Routes.userPage(dungeon.author)}>
            {dungeon.author.name}
          </Link>
        </div>
      </div>

      <GameContainer
        mode="play"
        dungeon={dungeon}
      />

      <div style={{ marginTop: 20 }}>
        <Link href="/">
          Home
        </Link>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const dungeonId = decodeUid('dungeon', context.params?.uid as string) ?? 0;

  const dungeon = await db.dungeon.findUnique({
    where: { id: dungeonId },
    include: { author: { select: { name: true } } },
  });
  if (!dungeon) return { notFound: true };

  return {
    props: {
      dungeon,
    },
  };
};
