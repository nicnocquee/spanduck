import { Field, Form, Formik } from "formik";
import Link from "next/link";
import { useState } from "react";
import { AuthError } from "@supabase/supabase-js";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

import { ErrorAlert, SuccessAlert } from "@/components/Alert";
import PageMeta from "@/components/PageMeta";
import { SIGN_UP_SUCCESS } from "@/constants/strings";
import { GetServerSidePropsContext } from "next";
import { hasUserSession } from "@/utils/routes";

function RegisterPage() {
  const supabaseClient = useSupabaseClient();
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  const handleSubmit = async (
    values: {
      name: string;
      email: string;
      password: string;
    },
    { resetForm }: { resetForm: () => void }
  ) => {
    const { error } = await supabaseClient.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { name: values.name },
      },
    });

    if (error) {
      setAuthError(error);
    } else {
      setAuthSuccess(SIGN_UP_SUCCESS);
      resetForm();
    }
  };

  return (
    <PageMeta title="Create a new account">
      <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Create a new account
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {authSuccess && (
              <div className="mb-6">
                <SuccessAlert message={authSuccess} />
              </div>
            )}
            {authError && (
              <div className="mb-6">
                <ErrorAlert message={authError.message} />
              </div>
            )}
            <Formik
              initialValues={{ name: "", email: "", password: "" }}
              onSubmit={handleSubmit}>
              <Form className="space-y-6">
                <div>
                  <label htmlFor="name" className="x-label">
                    Your name
                  </label>
                  <div className="mt-1">
                    <Field
                      required
                      id="name"
                      name="name"
                      type="name"
                      autoComplete="name"
                      className="x-input"
                    />
                  </div>
                </div>
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
                <div>
                  <button type="submit" className="x-button">
                    Sign up
                  </button>
                </div>
              </Form>
            </Formik>
          </div>
          <div className="mt-6 space-x-1 text-sm flex items-center justify-center">
            <span>Already have an account?</span>
            <Link href="/login" className="x-link">
              Sign in
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

export default RegisterPage;
