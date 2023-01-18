import React from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PrismaClient, Dungeon, User } from '@prisma/client';
import { Api } from '@/utils/api-client';
import { Routes } from '@/utils/routes';
import { withSessionSsr } from "@/utils/session";

type Props = {
  dungeons: Dungeon[],
  user: User|null,
};

export default function HomePage({ dungeons, user }: Props) {
  const router = useRouter();

  const onClickNew = async () => {
    const dungeon = await Api.createDungeon();
    router.push(Routes.editDungeon(dungeon));
  };

  const onClickSignup = async () => {
    const user = await Api.signup('test3', 'hellolongerpass');
    console.log(user);
  };

  const onClickLogin = async () => {
    const reponse = await Api.login('test1', 'hello');
    console.log(reponse);
  };

  const onClickLogout = async () => {
    const reponse = await Api.logout();
    console.log(reponse);
  };

  return (
    <div>
      <h1>Dungeon Maker</h1>
      {user && <div>Hello {user.name}!</div>}

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

      <br />

      <button onClick={onClickSignup}>
        New User
      </button>

      <br />

      <button onClick={onClickLogin}>
        Login
      </button>

      <br />

      <button onClick={onClickLogout}>
        Logout
      </button>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = withSessionSsr(
  async function getServerSideProps({ req }) {
    const db = new PrismaClient();
    const dungeons = await db.dungeon.findMany();
    const user = await db.user.findUnique({
      where: { id: req.session.userId ?? 0 },
    });
    db.$disconnect();

    return {
      props: {
        dungeons,
        user,
      },
    };
  }
);
