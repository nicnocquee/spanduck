import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import { useState } from "react";
import { useQuery } from "react-query";
import { useRouter } from "next/router";
import { useUser } from "@supabase/auth-helpers-react";

import { GeneratedImageSchemaType } from "@/api/schemas/generated-image";
import { ProjectSchemaType } from "@/api/schemas/project";
import { getProjectByID } from "@/api/usecases/database/project";
import DashboardLayout from "@/components/DashboardLayout";
import AddGeneratedImageModal from "@/components/generated-image/AddGeneratedImageModal";
import DeleteGeneratedImageModal from "@/components/generated-image/DeleteGeneratedImageModal";
import fetcher from "@/config/axios";
import buildQueryParams from "@/utils/build-query-params";
import { hasUserSession } from "@/utils/routes";
import { ArrowPathIcon, EyeIcon, TrashIcon } from "@heroicons/react/24/outline";

type ProjectViewProps = {
  project: ProjectSchemaType;
};

function ProjectView({ project }: ProjectViewProps) {
  const user = useUser();
  const router = useRouter();
  const { query: queryParams } = router;
  const { templateID } = queryParams;
  const generateFromTemplate = !!templateID || false;

  const query = {
    order: {
      updated_at: "desc",
    },
    filter: {
      project_id: project.id,
      user_id: user?.id,
    },
    from: 0,
    to: 10,
    limit: 10,
  };

  const {
    data: generated,
    isLoading,
    refetch,
  } = useQuery(
    `project ${project.id} generated images`,
    async () => {
      const queryParams = buildQueryParams(query);
      const { data } = await fetcher().get(`/generated-images?${queryParams}`);

      return data.data;
    },
    { initialData: [], enabled: !!user?.id }
  );

  const [selectedGeneratedImage, setSelectedGeneratedImage] =
    useState<GeneratedImageSchemaType | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(generateFromTemplate);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <>
      <AddGeneratedImageModal
        open={addModalOpen}
        setOpen={setAddModalOpen}
        onClose={() => refetch()}
        templateID={parseInt(templateID as string, 10) || 1}
        projectID={project.id}
      />
      <DeleteGeneratedImageModal
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        imageToDelete={selectedGeneratedImage}
        onDelete={() => refetch()}
      />
      <DashboardLayout title={project.name}>
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold leading-6 text-gray-900">
              {project.name}
            </h1>
            <p className="mt-2 text-sm text-gray-700">{project.description}</p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="block rounded bg-indigo-600 py-2 px-3 text-center text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              Generate
            </button>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <ul
                role="list"
                className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
                {isLoading ? (
                  <div className="col-span-4 h-32 flex items-center justify-center">
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  </div>
                ) : generated.length < 1 ? (
                  <div className="col-span-4 h-32 flex items-center justify-center">
                    No generated images to display
                  </div>
                ) : (
                  generated.map((item: GeneratedImageSchemaType) => (
                    <li key={item.image} className="relative">
                      <div className="group aspect-w-10 aspect-h-7 block w-full overflow-hidden rounded-lg bg-black-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={1920}
                          height={1280}
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
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGeneratedImage(item);
                              setDeleteModalOpen(true);
                            }}
                            className="focus:outline-none hidden group-hover:block">
                            <TrashIcon className="w-5 h-5 text-red-600 hover:text-red-900" />
                          </button>
                        </div>
                      </div>
                      <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">
                        {item.name}
                      </p>
                      <p className="pointer-events-none block truncate text-sm font-medium text-gray-500">
                        {item.url}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
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

  const { id } = ctx.query;
  const { data: response } = await getProjectByID(parseInt(id as string, 10));
  if (response) {
    if (response.length < 1) {
      return {
        notFound: true,
      };
    }

    const [project] = response;
    return {
      props: {
        project,
      },
    };
  }

  return {
    notFound: true,
  };
}

export default ProjectView;
