import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, ReactElement, useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

import { classNames } from "@/utils/classNames";
import { Dialog, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  HomeIcon,
  XMarkIcon,
  CubeIcon,
  NewspaperIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Projects", href: "/projects", icon: CubeIcon },
  { name: "Templates", href: "/templates", icon: NewspaperIcon },
];

export type DashboardLayoutProps = {
  title: string;
  children: ReactElement | ReactElement[];
};

export default function DashboardLayout({
  title,
  children,
}: DashboardLayoutProps) {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const user = useUser();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const avatarText = user?.user_metadata.name?.split(" ")?.[0]?.[0];

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-40 lg:hidden"
            onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0">
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>
            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full">
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-indigo-700">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0">
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                      <button
                        type="button"
                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={() => setSidebarOpen(false)}>
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
                    <div className="flex flex-shrink-0 items-center px-4">
                      <h1 className="text-xl text-white font-bold">Spanduck</h1>
                    </div>
                    <nav className="mt-5 space-y-1 px-2">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            item.href === router.pathname
                              ? "bg-indigo-800 text-white"
                              : "text-white hover:bg-indigo-600 hover:bg-opacity-75",
                            "group flex items-center px-2 py-2 text-base font-medium rounded-md"
                          )}>
                          <item.icon
                            className="mr-4 h-6 w-6 flex-shrink-0 text-indigo-300"
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      ))}
                    </nav>
                  </div>
                  <div className="flex flex-shrink-0 border-t border-indigo-800 p-4">
                    <Link href="/" className="group block flex-shrink-0">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center bg-gray-100 rounded-full">
                          <p>{avatarText}</p>
                        </div>
                        <div className="ml-3">
                          <p className="text-base font-medium text-white">
                            {user?.user_metadata?.name}
                          </p>
                          <button
                            onClick={() => handleLogout()}
                            className="text-sm font-medium text-indigo-200 group-hover:text-white">
                            Logout
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
              <div className="w-14 flex-shrink-0" aria-hidden="true">
                {/* Force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </Dialog>
        </Transition.Root>
        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex min-h-0 flex-1 flex-col bg-indigo-700">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <h1 className="text-xl text-white font-bold">Spanduck</h1>
              </div>
              <nav className="mt-5 flex-1 space-y-1 px-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      item.href === router.pathname
                        ? "bg-indigo-800 text-white"
                        : "text-white hover:bg-indigo-600 hover:bg-opacity-75",
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                    )}>
                    <item.icon
                      className="mr-3 h-6 w-6 flex-shrink-0 text-indigo-300"
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex flex-shrink-0 border-t border-indigo-800 p-4">
              <Link href="/" className="group block w-full flex-shrink-0">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center bg-gray-100 rounded-full">
                    <p>{avatarText}</p>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">
                      {user?.user_metadata?.name}
                    </p>
                    <button
                      onClick={() => handleLogout()}
                      className="text-xs font-medium text-indigo-200 group-hover:text-white">
                      Logout
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col lg:pl-64">
          <div className="sticky top-0 z-10 bg-gray-100 pl-1 pt-1 sm:pl-3 sm:pt-3 lg:hidden">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setSidebarOpen(true)}>
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <main className="flex-1">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
