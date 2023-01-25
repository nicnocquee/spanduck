import { Field, Form, Formik } from "formik";
import Link from "next/link";
import { useState } from "react";

import PageMeta from "@/components/PageMeta";
import { authPage } from "@/utils/routes";
import { supabase } from "@/utils/supabase";
import { AuthError } from "@supabase/supabase-js";
import { ErrorAlert } from "@/components/Alert";

function LoginPage() {
  const [authError, setAuthError] = useState<AuthError | null>(null);

  return (
    <PageMeta title="Sign in to your account">
      <div className="flex min-h-full md:min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Sign in to your account
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-card dark:bg-card-dark py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {authError && (
              <div className="mb-6">
                <ErrorAlert message={authError.message} />
              </div>
            )}
            <Formik
              initialValues={{ email: "", password: "" }}
              onSubmit={async (values) => {
                const { email, password } = values;

                const { error } = await supabase.auth.signInWithPassword({
                  email,
                  password,
                });

                setAuthError(error);
              }}>
              <Form className="space-y-6">
                <div>
                  <label htmlFor="email" className="x-form-label">
                    Email address
                  </label>
                  <div className="mt-1">
                    <Field
                      required
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="x-form-input"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="x-form-label">
                    Password
                  </label>
                  <div className="mt-1">
                    <Field
                      required
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      className="x-form-input"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="x-form-checkbox"
                    />
                    <label htmlFor="remember-me" className="ml-2 block">
                      Remember me
                    </label>
                  </div>
                  <div>
                    <Link href="/forgot" className="x-link">
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

export default authPage(LoginPage);
