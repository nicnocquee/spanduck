import { Field, Form, Formik } from "formik";
import Link from "next/link";
import { useState } from "react";

import { ErrorAlert, SuccessAlert } from "@/components/Alert";
import PageMeta from "@/components/PageMeta";
import { SIGN_UP_SUCCESS } from "@/constants/strings";
import { authPage } from "@/utils/routes";
import { supabase } from "@/utils/supabase";
import { AuthError } from "@supabase/supabase-js";

function RegisterPage() {
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  return (
    <PageMeta title="Create a new account">
      <div className="flex min-h-full md:min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Create a new account
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-card dark:bg-card-dark py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
              onSubmit={async (values, { resetForm }) => {
                const { name, email, password } = values;

                const { error } = await supabase.auth.signUp({
                  email,
                  password,
                  options: { data: { name } },
                });

                if (error) {
                  setAuthError(error);
                } else {
                  setAuthSuccess(SIGN_UP_SUCCESS);
                  resetForm();
                }
              }}>
              <Form className="space-y-6">
                <div>
                  <label htmlFor="name" className="x-form-label">
                    Your name
                  </label>
                  <div className="mt-1">
                    <Field
                      required
                      name="name"
                      type="text"
                      autoComplete="name"
                      className="x-form-input"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="x-form-label">
                    Email address
                  </label>
                  <div className="mt-1">
                    <Field
                      required
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
                      name="password"
                      type="password"
                      className="x-form-input"
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

export default authPage(RegisterPage);
