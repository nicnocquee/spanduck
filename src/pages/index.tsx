import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useQuery } from "react-query";

import { GeneratedImageSchemaType } from "@/api/schemas/generated-image";
import { ProjectSchemaType } from "@/api/schemas/project";
import { getGeneratedImages } from "@/api/usecases/database/generated-image";
import { getProjects } from "@/api/usecases/database/project";
import serverSupabaseClient from "@/api/utils/server-supabase-client";
import DashboardLayout from "@/components/DashboardLayout";
import GeneratedImageItem from "@/components/generated-image/GeneratedImageItem";
import fetcher from "@/config/axios";
import buildQueryParams from "@/utils/build-query-params";
import { hasUserSession } from "@/utils/routes";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useUser } from "@supabase/auth-helpers-react";

type DashboardPageProps = {
  projects: ProjectSchemaType[];
  generatedImages: GeneratedImageSchemaType[];
};

interface GeneratedImageSchemaWithProjectInterface
  extends GeneratedImageSchemaType {
  project: ProjectSchemaType;
}

function DashboardPage({ projects, generatedImages }: DashboardPageProps) {
  const user = useUser();

  const { data: generatedImagesData, isLoading: isGeneratedImagesLoading } =
    useQuery(
      `generated images ${user?.id} overview`,
      async () => {
        const query = {
          order: {
            updated_at: "desc",
          },
          filter: {
            user_id: user?.id,
          },
          limit: 4,
        };
        const queryParams = buildQueryParams(query);
        const { data } = await fetcher().get(
          `/generated-images?${queryParams}`
        );

        return data.data;
      },
      { initialData: generatedImages, enabled: !!user?.id }
    );

  const { data: projectsData, isLoading: isProjectsLoading } = useQuery(
    `projects ${user?.id} overview`,
    async () => {
      const query = {
        order: {
          updated_at: "desc",
        },
        filter: {
          user_id: user?.id,
        },
        limit: 4,
      };
      const queryParams = buildQueryParams(query);
      const { data } = await fetcher().get(`/projects?${queryParams}`);

      return data.data;
    },
    { initialData: projects, enabled: !!user?.id }
  );

  return (
    <DashboardLayout title="Dashboard">
      <h1 className="text-xl font-semibold leading-6 text-gray-900">
        Hello, {user?.user_metadata.name}! 👋
      </h1>
      <h2 className="mt-2 text-sm text-gray-700">
        What are you going to do today?
      </h2>
      <div className="mt-8 flow-root px-4 lg:px-0">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <h1 className="text-xl font-semibold leading-6 text-gray-900 mb-4">
              Recent
            </h1>
            <ul
              role="list"
              className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
              {isGeneratedImagesLoading ? (
                <div className="col-span-4 h-32 flex items-center justify-center">
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                </div>
              ) : generatedImagesData.length < 1 ? (
                <div className="col-span-4 h-32 flex items-center justify-center">
                  No generated images to display
                </div>
              ) : (
                generatedImagesData.map(
                  (item: GeneratedImageSchemaWithProjectInterface) => (
                    <li key={item.image} className="relative">
                      <GeneratedImageItem item={item} showDelete={false} />
                      <Link
                        className="mt-2 text-sm text-gray-700 hover:underline"
                        href={`/projects/${item.project_id}`}>
                        {item.project.name}
                      </Link>
                    </li>
                  )
                )
              )}
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-8 flow-root px-4 lg:px-0">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <h1 className="text-xl font-semibold leading-6 text-gray-900 mb-4">
              Your projects
            </h1>
            <ul
              role="list"
              className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
              {isProjectsLoading ? (
                <div className="w-full h-32 flex items-center justify-center">
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                </div>
              ) : projectsData.length < 1 ? (
                <div className="w-full h-32 flex items-center justify-center">
                  No projects to display
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300 col-span-2 sm:col-span-3 lg:col-span-4">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {projectsData.map((project: ProjectSchemaType) => (
                      <tr key={project.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          <Link
                            href={`/projects/${project.id}`}
                            className="text-indigo-600 hover:text-indigo-900">
                            {project.name}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {project.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  // Check if user is logged in
  const isLoggedIn = await hasUserSession(ctx);
  if (!isLoggedIn) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  // Get current user
  const {
    data: { user },
  } = await serverSupabaseClient(ctx).auth.getUser();
  const userID = user?.id.toString();

  // Get initial data
  const [getProject, getGeneratedImage] = await Promise.allSettled([
    await getProjects({
      filter: `user_id:${userID}`,
      order: "updated_at:desc",
      limit: 5,
    }),
    await getGeneratedImages({
      filter: `user_id:${userID}`,
      order: "updated_at:desc",
      limit: 4,
    }),
  ]);

  let projects: ProjectSchemaType[] = [];
  let generatedImages: GeneratedImageSchemaType[] = [];
  if (getProject.status === "fulfilled") {
    projects = getProject.value.data as ProjectSchemaType[];
  }

  if (getGeneratedImage.status === "fulfilled") {
    generatedImages = getGeneratedImage.value
      .data as GeneratedImageSchemaType[];
  }

  return {
    props: {
      projects,
      generatedImages,
    },
  };
}

export default DashboardPage;
