import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { PrismaClient, Dungeon } from '@prisma/client';
import { Api } from '@/utils/api-client';

type Props = {
  dungeon: Dungeon,
};

export default function EditPage({ dungeon }: Props) {
  const [name, setName] = useState(dungeon.name);

  const onClickSave = async () => {
    await Api.updateDungeon(dungeon.id, { name });
    alert('ok!');
  };

  return (
    <div>
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          value={name ?? ''}
          onChange={event => setName(event.target.value)}
        />
      </div>
      {/* <h1>{dungeon.name}</h1> */}

      <button type="button" onClick={onClickSave}>
        Save
      </button>

      <Link href="/">
        Back
      </Link>
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
