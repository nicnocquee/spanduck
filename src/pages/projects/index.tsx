import { useEffect, useState } from "react";

import AddProjectModal from "@/components/AddProjectModal";
import DashboardLayout from "@/components/DashboardLayout";
import { protectPage } from "@/utils/routes";

export type Project = {
  id: string;
  name: string;
  description: string;
};

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    // TODO
    setProjects([
      {
        id: "project-x",
        name: "Project X",
        description: "The best project ever",
      },
      {
        id: "project-y",
        name: "Project Y",
        description: "The best project ever",
      },
      {
        id: "project-z",
        name: "Project Z",
        description: "The best project ever",
      },
    ]);
  }, []);

  return (
    <DashboardLayout title="Projects">
      <AddProjectModal
        open={addModalOpen}
        setOpen={setAddModalOpen}
        projectToEdit={null}
      />
      <AddProjectModal
        open={editModalOpen}
        setOpen={setEditModalOpen}
        projectToEdit={projectToEdit}
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
      <div className="mt-8 flow-root">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden ring-1 ring-black ring-opacity-10 sm:rounded-lg">
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
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {project.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {project.description}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => {
                            setProjectToEdit(project);
                            setEditModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default protectPage(Projects);
