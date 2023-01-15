import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { PrismaClient, Dungeon } from '@prisma/client';
import { Api } from '@/utils/api-client';
import { TileGrid } from '@/components/TileGrid';
import { TileMap } from '@/types';

const initialTiles: TileMap = [
  [1, 1, 1, 1, 0, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 0, 1, 1, 1, 1],
];

type Props = {
  dungeon: Dungeon,
};

export default function EditPage({ dungeon }: Props) {
  const [name, setName] = useState(dungeon.name);
  const [tiles, setTiles] = useState<TileMap>(dungeon.tiles ? JSON.parse(dungeon.tiles) : initialTiles);

  const onClickSave = async () => {
    await Api.updateDungeon(dungeon.id, {
      name,
      tiles: JSON.stringify(tiles),
    });

    alert('ok!');
  };

  const toggleTile = (x: number, y: number) => {
    setTiles(rows => rows.map((row, index) => {

      if (index === y) {
        return row.map((tile, index) => {
          if (index === x) {
            return tile === 1 ? 0 : 1;
          } else {
            return tile;
          }
        });
      } else {
        return row;
      }
    }));
  };

  return (
    <div>
      <div>
        <input
          id="name"
          value={name ?? ''}
          onChange={event => setName(event.target.value)}
        />
      </div>

      <TileGrid
        tiles={tiles}
        onClickTile={toggleTile}
        isEditing
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
