/* eslint-disable @next/next/next-script-for-ga */

import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {process.env.NEXT_PUBLIC_VERCEL_ENV == "production" && (
          <>
            <script
              async
              src="https://www.googletagmanager.com/gtag/js?id=G-84TDV5T5TR"
            ></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-84TDV5T5TR');`,
              }}
            />
          </>
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
