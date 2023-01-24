import React, { useState } from 'react';
import type { MouseEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { Dungeon, User } from '@prisma/client';
import { Api } from '@/utils/api-client';
import { Routes } from '@/utils/routes';
import { withSessionSsr } from "@/utils/session";
import { db } from '@/utils/db';

type Props = {
  allDungeons: (Dungeon & { author: { name: string }})[],
  user: (User & { dungeons: Dungeon[] })|null,
};

export default function HomePage({ allDungeons, user }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<null|'signup-form'|'login-form'>(null);

  const onClickNewDungeon = async () => {
    const response = await Api.createDungeon();
    if ('error' in response) {
      alert(`Error: ${response.error}`);
    } else {
      const dungeon: Dungeon = response;
      router.push(Routes.editDungeon(dungeon));
    }
  };

  const onClickLogout = async () => {
    await Api.logout();
    setMode(null);
    router.push('/');
  };

  return (
    <div>
      <h1>Dungeon Maker</h1>

      {user
        ? <div>
            Hello {user.name}!
            &nbsp;&nbsp;
            <button onClick={onClickLogout}>
              Logout
            </button>
          </div>
        : <div>
            <button onClick={() => setMode('signup-form')}>
              Signup
            </button>
            &nbsp;&nbsp;
            <button onClick={() => setMode('login-form')}>
              Login
            </button>

            {mode == 'signup-form' && <SignupForm />}
            {mode == 'login-form' && <LoginForm />}
          </div>
      }

      {user &&
        <div>
          <h2>My Dungeons</h2>
          <ul>
            {user.dungeons.map(dungeon =>
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

          <button onClick={onClickNewDungeon}>
            New Dungeon
          </button>
        </div>
      }

      <h2>Latest Dungeons</h2>
      <ul>
        {allDungeons.map(dungeon =>
          <li key={dungeon.id}>
            <Link href={Routes.playDungeon(dungeon)}>
              {dungeon.name}
            </Link>
            {' '}
            (by {dungeon.author.name})
          </li>
        )}
      </ul>
    </div>
  )
}

export const getServerSideProps = withSessionSsr<Props>(
  async function getServerSideProps({ req }) {
    const allDungeons = await db.dungeon.findMany({
      orderBy: {
        id: 'desc',
      },
      include: {
        author: {
          select: { name: true },
        },
      },
    });

    const user = await db.user.findUnique({
      where: {
        id: req.session.userId ?? 0,
      },
      include: {
        dungeons: true,
      },
    });

    if (user) user.password = '?';

    return {
      props: {
        allDungeons,
        user,
      },
    };
  }
);

function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onClickLogin = async (event: MouseEvent) => {
    event.preventDefault();

    const response = await Api.login(username, password);
    if (!response.ok) {
      alert(response.error);
    } else {
      router.push('/');
    }
  };

  return (
    <form>
      <input
        placeholder="User Name"
        value={username}
        onChange={event => setUsername(event.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={event => setPassword(event.target.value)}
      />
      <button type="submit" onClick={onClickLogin}>
        Login
      </button>
    </form>
  );
}

function SignupForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onClickSignup = async (event: MouseEvent) => {
    event.preventDefault();

    const response = await Api.signup(username, password);
    if (!response.ok) {
      alert(response.error);
    } else {
      router.push('/');
    }
  };

  return (
    <form>
      <input
        placeholder="User Name"
        value={username}
        onChange={event => setUsername(event.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={event => setPassword(event.target.value)}
      />
      <button type="submit" onClick={onClickSignup}>
        Signup
      </button>
    </form>
  );
}
