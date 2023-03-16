import { Field, Form, Formik } from "formik";
import Link from "next/link";
import { useState } from "react";
import { AuthError } from "@supabase/supabase-js";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

import { ErrorAlert } from "@/components/Alert";
import PageMeta from "@/components/PageMeta";
import { hasUserSession } from "@/utils/routes";

function LoginPage() {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const [authError, setAuthError] = useState<AuthError | null>(null);

  const handleSubmit = async (values: { email: string; password: string }) => {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setAuthError(error);
    }

    router.push("/");
  };

  return (
    <PageMeta title="Sign in to your account">
      <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {authError && (
              <div className="mb-6">
                <ErrorAlert message={authError.message} />
              </div>
            )}
            <Formik
              initialValues={{ email: "", password: "" }}
              onSubmit={handleSubmit}>
              <Form className="space-y-6">
                <div>
                  <label htmlFor="email" className="x-label">
                    Email address
                  </label>
                  <div className="mt-1">
                    <Field
                      required
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="x-input"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="x-label">
                    Password
                  </label>
                  <div className="mt-1">
                    <Field
                      required
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      className="x-input"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Field
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="x-checkbox"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-900">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <Link
                      href="/forgot"
                      className="font-medium text-indigo-600 hover:text-indigo-500">
                      Forgot your password?
                    </Link>
                  </div>
                </div>
                <div>
                  <button type="submit" className="x-button">
                    Sign in
                  </button>
                </div>
              </Form>
            </Formik>
          </div>
          <div className="mt-6 space-x-1 text-sm flex items-center justify-center">
            <span>Don't have an account yet?</span>
            <Link href="/register" className="x-link">
              Sign up now
            </Link>
          </div>
        </div>
      </div>
    </PageMeta>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  // Check if user is logged in
  const isLoggedIn = await hasUserSession(ctx);
  if (isLoggedIn) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

export default LoginPage;
