import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/20/solid";

type AlertProps = {
  message: string;
};

export function SuccessAlert({ message }: AlertProps) {
  return (
    <div className="rounded-md bg-red-50 dark:bg-green-600 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <CheckCircleIcon
            className="h-5 w-5 text-green-400 dark:text-white"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-green-800 dark:text-white">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ErrorAlert({ message }: AlertProps) {
  return (
    <div className="rounded-md bg-red-50 dark:bg-red-600 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon
            className="h-5 w-5 text-red-400 dark:text-white"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-red-800 dark:text-white">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
