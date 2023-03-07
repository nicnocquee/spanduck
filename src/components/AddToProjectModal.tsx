import { Field, Form, Formik } from "formik";
import { Dispatch, Fragment, SetStateAction, useState } from "react";

import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { ErrorAlert } from "./Alert";
import { Template } from "@/pages/templates";
import { Project } from "@/pages/projects";

type AddToProjectModalProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  projects: Project[];
  selectedTemplate?: Template;
};

type FormValues = {
  projectId: string;
};

export default function AddToProjectModal({
  open,
  setOpen,
  projects,
  selectedTemplate,
}: AddToProjectModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (values: FormValues) => {};

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
                    templateId: selectedTemplate?.id,
                    templateName: selectedTemplate?.name,
                    projectId: "",
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
                        Add to Project
                      </Dialog.Title>
                      {errorMessage && (
                        <div className="mt-4">
                          <ErrorAlert message={errorMessage} />
                        </div>
                      )}
                      <div className="mt-4">
                        <label
                          htmlFor="templateName"
                          className="block text-sm font-medium leading-6 text-gray-900">
                          Selected Template
                        </label>
                        <div className="mt-2">
                          <Field
                            disabled
                            type="text"
                            id="templateName"
                            name="templateName"
                            className="block w-full rounded-md bg-gray-100 border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label
                          htmlFor="description"
                          className="block text-sm font-medium leading-6 text-gray-900">
                          Select Project
                        </label>
                        <div className="mt-2">
                          <Field
                            as="select"
                            id="projectId"
                            name="projectId"
                            defaultValue={projects.at(0)?.id}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                            {projects.map((project) => (
                              <option key={project.id} value={project.id}>
                                {project.name}
                              </option>
                            ))}
                          </Field>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-6">
                      <button
                        type="submit"
                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        Add
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
