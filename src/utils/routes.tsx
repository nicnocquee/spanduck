import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { Fragment, useEffect } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { isNil, isNotNil } from "./isNil";

export const protectPage = <P extends object>(
  WrappedComponent: NextPage<P>
) => {
  const Component: NextPage<P> = (props) => {
    const router = useRouter();
    const { isFetching, data } = useAuth();

    useEffect(() => {
      if (isNil(data)) {
        router.replace("/login");
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    if (isFetching) return <Fragment />;

    return <WrappedComponent {...props} />;
  };

  if (WrappedComponent.getInitialProps) {
    Component.getInitialProps = WrappedComponent.getInitialProps;
  }

  return Component;
};

export const authPage = <P extends object>(WrappedComponent: NextPage<P>) => {
  const Component: NextPage<P> = (props) => {
    const router = useRouter();
    const { isFetching, data } = useAuth();

    useEffect(() => {
      if (isNotNil(data)) {
        router.replace("/");
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    if (isFetching) return <Fragment />;

    return <WrappedComponent {...props} />;
  };

  if (WrappedComponent.getInitialProps) {
    Component.getInitialProps = WrappedComponent.getInitialProps;
  }

  return Component;
};
