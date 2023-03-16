import { GetServerSidePropsContext } from "next";
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
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import serverSupabaseClient from "@/api/utils/server-supabase-client";
import { getGeneratedImages } from "@/api/usecases/database/generated-image";
import GeneratedImageItem from "@/components/generated-image/GeneratedImageItem";

type ProjectViewProps = {
  project: ProjectSchemaType;
  generatedImages: GeneratedImageSchemaType[];
};

function ProjectView({ project, generatedImages }: ProjectViewProps) {
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
    { initialData: generatedImages, enabled: !!user?.id }
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
        <div className="mt-8 flow-root px-4 lg:px-0">
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
                      <GeneratedImageItem
                        item={item}
                        onDelete={(i) => {
                          setSelectedGeneratedImage(i);
                          setDeleteModalOpen(true);
                        }}
                      />
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

  // Get current user
  const {
    data: { user },
  } = await serverSupabaseClient(ctx).auth.getUser();
  const userID = user?.id.toString();

  // Get initial data
  const { id } = ctx.query;
  const projectID = parseInt(id as string, 10);
  const [getProject, getGeneratedImage] = await Promise.allSettled([
    await getProjectByID(projectID),
    await getGeneratedImages({
      filter: `user_id:${userID};project_id:${projectID}`,
      order: `updated_at:desc`,
    }),
  ]);

  let project: ProjectSchemaType;
  let generatedImages: GeneratedImageSchemaType[] = [];
  if (getProject.status === "fulfilled") {
    [project] = getProject.value.data as ProjectSchemaType[];
  } else {
    return {
      notFound: true,
    };
  }

  if (getGeneratedImage.status === "fulfilled") {
    generatedImages = getGeneratedImage.value
      .data as GeneratedImageSchemaType[];
  }

  return {
    props: {
      project,
      generatedImages,
    },
  };
}

export default ProjectView;
