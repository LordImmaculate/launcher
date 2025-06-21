import { auth } from "@/auth";
import StatusBlock from "@/components/status-block";
import { prisma } from "@/prisma";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (!session || !session.user?.id) redirect("/auth/sign-in");

  const apps = await prisma.app.findMany();

  return (
    <div className="flex flex-col items-center mt-12 gap-4">
      <h1 className="text-3xl font-bold">Apps</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {apps.map((app) => (
          <StatusBlock app={app} userId={session.user?.id ?? ""} key={app.id} />
        ))}
      </div>
    </div>
  );
}
