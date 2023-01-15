import React, { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { PrismaClient, Dungeon } from '@prisma/client';
import { initGame } from '@/game';

type Props = {
  dungeon: Dungeon,
};

export default function PlayPage({ dungeon }: Props) {
  const [ref, setRef] = useState<HTMLDivElement|null>(null);
  useEffect(() => {
    const game = initGame(ref, dungeon);

    return () => {
      if (game) game.destroy();
    };
  }, [ref, dungeon]);

  return (
    <div>
      <h1>{dungeon.name}</h1>
      <div ref={setRef} />
      <div style={{ marginTop: 20 }}>
        <Link href="/">
          Back
        </Link>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = Number(context.params?.id);

  const db = new PrismaClient();
  const dungeon = await db.dungeon.findUnique({ where: { id } });
  db.$disconnect();

  return {
    props: {
      dungeon,
    },
  };
};
