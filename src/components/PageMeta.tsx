import Head from "next/head";
import { ReactElement } from "react";

type PageMetaProps = {
  title: string;
  description?: string;
  children: ReactElement;
};

export default function PageMeta({
  title,
  description,
  children,
}: PageMetaProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>
      {children}
    </>
  );
}
