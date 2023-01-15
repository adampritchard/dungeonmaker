import React from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { PrismaClient, Dungeon } from '@prisma/client';
import { decodeUid } from '@/utils/uids';
import { GameContainer } from '@/components/GameContainer';

type Props = {
  dungeon: Dungeon,
};

export default function PlayPage({ dungeon }: Props) {
  return (
    <div>
      <h1>{dungeon.name}</h1>

      <GameContainer
        mode="play"
        dungeon={dungeon}
      />

      <div style={{ marginTop: 20 }}>
        <Link href="/">
          Back
        </Link>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = decodeUid(context.params?.uid as string);

  const db = new PrismaClient();
  const dungeon = await db.dungeon.findUnique({ where: { id } });
  db.$disconnect();

  return {
    props: {
      dungeon,
    },
  };
};
