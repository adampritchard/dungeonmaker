import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { PrismaClient, Dungeon } from '@prisma/client';
import { Api } from '@/utils/api-client';
import { decodeUid } from '@/utils/uids';
import { assert } from '@/utils/misc';
import { GameContainer } from '@/components/GameContainer';
import type { Game } from '@/game';

type Props = {
  dungeon: Dungeon,
};

export default function EditPage({ dungeon }: Props) {
  const [name, setName] = useState(dungeon.name);
  const [gameRef, setGameRef] = useState<Game|null>(null);

  const onClickSave = async () => {
    assert(gameRef);

    await Api.updateDungeon(dungeon.id, {
      name,
      tiles: JSON.stringify(gameRef.tiles),
    });

    alert('ok!');
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <input
          id="name"
          value={name ?? ''}
          onChange={event => setName(event.target.value)}
        />
      </div>

      <GameContainer
        mode="edit"
        dungeon={dungeon}
        gameRef={setGameRef}
      />

      <div style={{ marginTop: 20 }}>
        <button type="button" onClick={onClickSave} style={{ marginRight: 10 }}>
          Save
        </button>

        <Link href="/">
          Back
        </Link>
      </div>
    </div>
  )
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
