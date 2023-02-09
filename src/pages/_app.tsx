import "@/styles/globals.css";

import { ThemeProvider } from "next-themes";

import { AuthProvider } from "@/contexts/AuthContext";

import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
