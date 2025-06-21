import { auth } from "@/auth";
import AppDialog from "@/components/app-dialog";
import StatusBlock from "@/components/status-block";
import { Button } from "@/components/ui/button";
import { prisma } from "@/prisma";
import { redirect } from "next/navigation";
import { FaPlus } from "react-icons/fa6";

export default async function Home() {
  const session = await auth();
  if (!session || !session.user?.id) redirect("/auth/sign-in");

  const apps = await prisma.app.findMany({
    where: { userId: session.user.id }
  });

  const trigger = (
    <Button variant="outline" className="h-36 w-36 relative group">
      <FaPlus />
      <span className="absolute bottom-1 group-hover:opacity-100 opacity-0 transition-opacity duration-300 text-center text-sm grid-flow-col">
        Create an App
      </span>
    </Button>
  );

  return (
    <div className="flex flex-col items-center mt-12 gap-4">
      <h1 className="text-3xl font-bold">Apps</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {apps.map((app) => (
          <StatusBlock app={app} key={app.id} />
        ))}

        <AppDialog trigger={trigger} type="create" />
      </div>
    </div>
  );
}
