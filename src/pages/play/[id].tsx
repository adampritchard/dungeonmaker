import React from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { PrismaClient, Dungeon } from '@prisma/client';
import { TileGrid } from '@/components/TileGrid';

type Props = {
  dungeon: Dungeon,
};

export default function PlayPage({ dungeon }: Props) {
  return (
    <div>
      <h1>{dungeon.name}</h1>

      <TileGrid
        tiles={dungeon.tiles ? JSON.parse(dungeon.tiles) : []}
        onClickTile={() => {}}
      />

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
