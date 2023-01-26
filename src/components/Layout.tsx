import Head from 'next/head';

type Props = {
  pageTitle?: string|null,
  children: React.ReactNode,
};

export function Layout({ pageTitle, children }: Props) {
  return (
    <>
      <Head>
        {pageTitle
          ? <title>{pageTitle} &bull; Dungeon Maker</title>
          : <title>Dungeon Maker</title>
        }
        
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      {children}
    </>
  )
}
