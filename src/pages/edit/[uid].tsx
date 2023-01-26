import React, { useState } from 'react';
import Link from 'next/link';
import type { Dungeon, User } from '@prisma/client';
import { Api } from '@/utils/api-client';
import { decodeUid } from '@/utils/uids';
import { assert } from '@/utils/misc';
import { withSessionSsr } from "@/utils/session";
import { db } from '@/utils/db';
import { Layout } from '@/components/Layout';
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
    <Layout pageTitle="Edit Dungeon">
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
    </Layout>
  );
}

export const getServerSideProps = withSessionSsr<Props>(
  async ({ req, params }) => {
    const dungeonId = decodeUid('dungeon', params?.uid as string) ?? 0;

    const dungeon = await db.dungeon.findUnique({ where: { id: dungeonId } });
    const user = await db.user.findUnique({
      where: { id: req.session.userId ?? 0 },
    });

    if (!dungeon) return { notFound: true };

    // TODO: redirect to login
    if (!user) {
      return {
        redirect: { destination: '/', permanent: false },
      };
    }

    // TODO: return unauthorised...
    if (user.id !== dungeon.authorId) {
      return {
        redirect: { destination: '/', permanent: false },
      };
    }

    return {
      props: {
        dungeon,
      },
    };
  }
);
