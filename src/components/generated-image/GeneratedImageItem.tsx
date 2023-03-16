import Image from "next/image";

import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { GeneratedImageSchemaType } from "@/api/schemas/generated-image";

type GeneratedImageItemProps = {
  item: GeneratedImageSchemaType;
  showDelete?: boolean;
  onDelete?: (item: GeneratedImageSchemaType) => void;
};

export default function GeneratedImageItem({
  item,
  showDelete = true,
  onDelete,
}: GeneratedImageItemProps) {
  return (
    <>
      <div className="group aspect-w-10 aspect-h-7 block w-full overflow-hidden rounded-lg bg-black-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
        <Image
          src={item.image}
          alt={item.name}
          width={512}
          height={512}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNct27vTwAHPwMUHwDGUQAAAABJRU5ErkJggg=="
          className="pointer-events-none object-cover group-hover:opacity-30"
        />
        <div className="flex gap-4 flex-row items-center justify-center w-full">
          <a
            href={item.image}
            target="_blank"
            rel="noopener noreferrer"
            className="focus:outline-none hidden group-hover:block">
            <EyeIcon className="w-5 h-5 text-indigo-600 hover:text-indigo-900" />
          </a>
          {showDelete ? (
            <button
              type="button"
              onClick={() => (onDelete ? onDelete(item) : null)}
              className="focus:outline-none hidden group-hover:block">
              <TrashIcon className="w-5 h-5 text-red-600 hover:text-red-900" />
            </button>
          ) : null}
        </div>
      </div>
      <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">
        {item.name}
      </p>
      <p className="pointer-events-none block truncate text-sm font-medium text-gray-500">
        {item.url}
      </p>
    </>
  );
}
