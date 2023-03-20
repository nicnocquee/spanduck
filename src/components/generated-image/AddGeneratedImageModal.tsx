import { Dispatch, Fragment, SetStateAction, useState } from "react";
import { Field, Form, Formik } from "formik";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-hot-toast";
import { useUser } from "@supabase/auth-helpers-react";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { ErrorAlert } from "../Alert";
import fetcher from "@/config/axios";
import { AxiosError } from "axios";

type AddGeneratedImageModalProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onClose: () => void;
  projectID: number;
  templateID: number;
};

type FormValues = {
  type: "url" | "twitter";
  url: string;
  template_id: number;
};

export default function AddGeneratedImageModal({
  open,
  setOpen,
  onClose,
  projectID,
  templateID,
}: AddGeneratedImageModalProps) {
  const user = useUser();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      await fetcher().post("/generated-images", {
        ...values,
        user_id: user?.id,
        project_id: projectID,
      });

      toast.success("Successfully created the project");

      setOpen(false);
      onClose();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const message = axiosError.response?.data?.message;

      if (message) {
        setErrorMessage(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <Formik
                  initialValues={{
                    type: "url",
                    url: "",
                    template_id: templateID,
                  }}
                  onSubmit={handleSubmit}>
                  <Form>
                    <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                      <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        onClick={() => setOpen(false)}>
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900">
                        New Image
                      </Dialog.Title>
                      {errorMessage && (
                        <div className="mt-4">
                          <ErrorAlert message={errorMessage} />
                        </div>
                      )}
                      <div className="mt-4">
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium leading-6 text-gray-900">
                          Type
                        </label>
                        <div className="mt-2">
                          <Field
                            as="select"
                            name="type"
                            required
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                            <option value="url">URL</option>
                            <option value="twitter">Twitter</option>
                          </Field>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label
                          htmlFor="url"
                          className="block text-sm font-medium leading-6 text-gray-900">
                          URL
                        </label>
                        <div className="mt-2">
                          <Field
                            type="text"
                            id="url"
                            name="url"
                            required
                            placeholder="https://"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label
                          htmlFor="template_id"
                          className="block text-sm font-medium leading-6 text-gray-900">
                          Template ID
                        </label>
                        <div className="mt-2">
                          <Field
                            type="number"
                            id="template_id"
                            name="template_id"
                            min={1}
                            defaultValue={templateID}
                            required
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-6">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        {isLoading ? "Loading..." : "Save"}
                      </button>
                    </div>
                  </Form>
                </Formik>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
