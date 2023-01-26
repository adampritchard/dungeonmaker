import Head from 'next/head';

type Props = {
  children: React.ReactNode
};

export function Layout({ children }: Props) {
  return (
    <>
      <Head>
        <title>Dungeon Maker</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      {children}
    </>
  )
}
