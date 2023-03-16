import { useState } from "react";
import { useQuery } from "react-query";
import Link from "next/link";
import { GetServerSidePropsContext } from "next";
import { useUser } from "@supabase/auth-helpers-react";

import AddProjectModal from "@/components/project/AddProjectModal";
import DeleteProjectModal from "@/components/project/DeleteProjectModal";
import DashboardLayout from "@/components/DashboardLayout";
import fetcher from "@/config/axios";
import { ProjectSchemaType } from "@/api/schemas/project";
import buildQueryParams from "@/utils/build-query-params";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { hasUserSession } from "@/utils/routes";
import serverSupabaseClient from "@/api/utils/server-supabase-client";
import { getProjects } from "@/api/usecases/database/project";

type ProjectsPageProps = {
  projects: ProjectSchemaType[];
};

function ProjectsPage({ projects }: ProjectsPageProps) {
  const user = useUser();
  const query = {
    order: {
      updated_at: "desc",
    },
    filter: {
      user_id: user?.id,
    },
  };

  const { data, isLoading, refetch } = useQuery(
    `user ${user?.id} projects`,
    async () => {
      const queryParams = buildQueryParams(query);
      const { data } = await fetcher().get(`/projects?${queryParams}`);
      return data.data;
    },
    {
      initialData: projects,
      enabled: !!user?.id,
    }
  );

  const [selectedProject, setSelectedProject] =
    useState<ProjectSchemaType | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <DashboardLayout title="Projects">
      <AddProjectModal
        open={addModalOpen}
        setOpen={setAddModalOpen}
        projectToEdit={null}
        onClose={() => refetch()}
      />
      <AddProjectModal
        open={editModalOpen}
        setOpen={setEditModalOpen}
        projectToEdit={selectedProject}
        onClose={() => refetch()}
      />
      <DeleteProjectModal
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        projectToDelete={selectedProject}
        onDelete={() => refetch()}
      />
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold leading-6 text-gray-900">
            Projects
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the projects in your account.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="block rounded bg-indigo-600 py-2 px-3 text-center text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            Add project
          </button>
        </div>
      </div>
      <div className="mt-8 flow-root px-4 lg:px-0">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden ring-1 ring-black ring-opacity-10 sm:rounded-lg">
              {isLoading ? (
                <div className="w-full h-32 flex items-center justify-center">
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                </div>
              ) : data.length < 1 ? (
                <div className="w-full h-32 flex items-center justify-center">
                  No projects to display
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300">
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
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {data.map((project: ProjectSchemaType) => (
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
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => {
                              setSelectedProject(project);
                              setEditModalOpen(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900">
                            Edit
                          </button>
                        </td>
                        <td className="w-4 relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => {
                              setSelectedProject(project);
                              setDeleteModalOpen(true);
                            }}
                            className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
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
  const { data: projects } = await getProjects({
    filter: `user_id:${userID}`,
    order: "updated_at:desc",
  });

  // Set the props
  if (projects) {
    if (projects.length < 1) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        projects,
      },
    };
  }

  return {
    props: {
      projects: [],
    },
  };
}

export default ProjectsPage;
