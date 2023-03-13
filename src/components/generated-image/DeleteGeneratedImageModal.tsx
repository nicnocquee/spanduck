import { Dispatch, Fragment, SetStateAction, useState } from "react";
import { toast } from "react-hot-toast";

import { GeneratedImageSchemaType } from "@/api/schemas/generated-image";
import fetcher from "@/config/axios";
import { Dialog, Transition } from "@headlessui/react";

import { ErrorAlert } from "../Alert";
import { AxiosError } from "axios";
import { classNames } from "@/utils/classNames";

type DeleteProjectModalProps = {
  imageToDelete: GeneratedImageSchemaType | null;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onDelete: () => void;
};

export default function DeleteGeneratedImageModal({
  imageToDelete,
  open,
  setOpen,
  onDelete,
}: DeleteProjectModalProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      await fetcher().delete(`/generated-images/${imageToDelete?.id}`);

      toast.success("Successfully deleted the generated image");

      setOpen(false);
      onDelete();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const message = axiosError.response?.data.message ?? "";

      setErrorMessage(message || "Unknown error");
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900">
                        Delete "{imageToDelete?.name}"
                      </Dialog.Title>
                      {errorMessage && (
                        <div className="mt-4">
                          <ErrorAlert message={errorMessage} />
                        </div>
                      )}
                      <div className="mt-4">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete this image? This
                          action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    disabled={isLoading}
                    className={classNames(
                      isLoading ? "bg-gray-300" : "bg-red-600 hover:bg-red-500",
                      "inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto"
                    )}
                    onClick={handleDelete}>
                    {isLoading ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setOpen(false)}>
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
