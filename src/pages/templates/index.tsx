import Image from "next/image";
import { useEffect, useState } from "react";

import AddToProjectModal from "@/components/AddToProjectModal";
import DashboardLayout from "@/components/DashboardLayout";
import { templates as templatesData } from "@/samples/templates";
import { projects as projectsData } from "@/samples/projects";
import { protectPage } from "@/utils/routes";
import { Project } from "../projects";

export type Template = {
  id: string;
  name: string;
  image: string;
  author: string;
};

function Templates() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template>();

  useEffect(() => {
    // TODO
    setProjects(projectsData);
    setTemplates(templatesData);
  }, []);

  return (
    <DashboardLayout title="Templates">
      <AddToProjectModal
        open={!!selectedTemplate}
        projects={projects}
        selectedTemplate={selectedTemplate}
        setOpen={() => setSelectedTemplate(undefined)}
      />
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold leading-6 text-gray-900">
            Templates
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all available templates you can use.
          </p>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <ul
              role="list"
              className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
              {templates.map((template) => (
                <li key={template.image} className="relative">
                  <div className="group aspect-w-10 aspect-h-7 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                    <Image
                      src={template.image}
                      alt={template.name}
                      width={1920}
                      height={1280}
                      className="pointer-events-none object-cover group-hover:opacity-75"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedTemplate(template)}
                      className="absolute inset-0 focus:outline-none"
                    />
                  </div>
                  <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">
                    {template.name}
                  </p>
                  <p className="pointer-events-none block text-sm font-medium text-gray-500">
                    {template.author}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default protectPage(Templates);
