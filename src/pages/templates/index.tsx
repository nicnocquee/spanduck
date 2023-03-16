import Image from "next/image";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { toast } from "react-hot-toast";
import { GetServerSidePropsContext } from "next";
import { useUser } from "@supabase/auth-helpers-react";

import AddToProjectModal from "@/components/AddToProjectModal";
import DashboardLayout from "@/components/DashboardLayout";
import { templates as templatesData } from "@/samples/templates";
import buildQueryParams from "@/utils/build-query-params";
import fetcher from "@/config/axios";
import { hasUserSession } from "@/utils/routes";
import serverSupabaseClient from "@/api/utils/server-supabase-client";
import { getProjects } from "@/api/usecases/database/project";
import { ProjectSchemaType } from "@/api/schemas/project";

export type Template = {
  id: number;
  name: string;
  image: string;
  author: string;
};

type TemplatesPageProps = {
  projects: ProjectSchemaType[];
};

function TemplatesPage({ projects }: TemplatesPageProps) {
  const user = useUser();
  const query = {
    order: {
      updated_at: "desc",
    },
    filter: {
      user_id: user?.id,
    },
    from: 0,
    to: 10,
    limit: 10,
  };

  const { data } = useQuery(
    "projects",
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
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template>();

  const handleChooseTemplate = (template: Template) => {
    if (data?.length < 1) {
      toast.error("Please create a project first.");
    } else {
      setSelectedTemplate(template);
    }
  };

  useEffect(() => {
    setTemplates(templatesData);
  }, []);

  return (
    <DashboardLayout title="Templates">
      <AddToProjectModal
        open={!!selectedTemplate}
        projects={data}
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
      <div className="mt-8 flow-root px-4 lg:px-0">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <ul
              role="list"
              className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
              {templates.map((template) => (
                <li key={template.image} className="relative">
                  <div className="group aspect-w-10 aspect-h-7 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                    <Image
                      src={require(`templates/images/${template.image}`)}
                      alt={template.name}
                      width={1920}
                      height={1280}
                      className="pointer-events-none object-cover group-hover:opacity-75"
                    />
                    <button
                      type="button"
                      onClick={() => handleChooseTemplate(template)}
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

export default TemplatesPage;
