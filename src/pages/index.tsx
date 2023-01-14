import React from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PrismaClient, Dungeon } from '@prisma/client';
import { Api } from '@/utils/api-client';
import { Routes } from '@/utils/routes';

type Props = {
  dungeons: Dungeon[],
};

export default function HomePage({ dungeons }: Props) {
  const router = useRouter();

  const onClickNew = async () => {
    const dungeon = await Api.createDungeon();
    router.push(Routes.editDungeon(dungeon));
  };

  return (
    <div>
      <h1>Dungeon Maker</h1>

      <ul>
        {dungeons.map(dungeon =>
          <li key={dungeon.id}>
            {dungeon.name}
            {' ('}
            <Link href={Routes.editDungeon(dungeon)}>
              Edit
            </Link>
            {' / '}
            <Link href={Routes.playDungeon(dungeon)}>
              Play
            </Link>
            {')'}
          </li>
        )}
      </ul>

      <button onClick={onClickNew}>
        New Dungeon
      </button>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const db = new PrismaClient();
  const dungeons = await db.dungeon.findMany();
  db.$disconnect();

  return {
    props: {
      dungeons,
    },
  };
};
