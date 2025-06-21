import { auth } from "@/auth";
import StatusBlock from "@/components/status-block";
import { prisma } from "@/prisma";
import axios from "axios";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (!session || !session.user?.id) redirect("/auth/sign-in");

  const username = "";
  const token = process.env.UPTIME_KUMA_TOKEN;
  const url = process.env.UPTIME_KUMA_URL;
  let data = null;
  let error = null;

  if (!token || !url) {
    throw new Error(
      "Uptime Kuma token and URL must be set in environment variables."
    );
  }

  try {
    const response = await axios.get(`${url}/metrics`, {
      auth: {
        username,
        password: token
      }
    });

    data = response.data;
  } catch (err) {
    if (err instanceof Error) {
      error = err.message;
    } else {
      error = String(err);
    }
  }

  const formattedData = data ? await parseServiceStatuses(data) : null;

  return (
    <div className="flex flex-col items-center mt-12 gap-4">
      <h1 className="text-3xl font-bold">Apps</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {formattedData ? (
          formattedData.map((service) =>
            service ? (
              <StatusBlock
                service={service}
                userId={session.user?.id || ""}
                key={service.id}
              />
            ) : null
          )
        ) : (
          <p className="text-lg">{error}</p>
        )}
      </div>
    </div>
  );
}

async function parseServiceStatuses(data: string) {
  const knownApps = await prisma.app.findMany();
  const appsToCreate: string[] = [];

  const statusLines = data
    .split("\n")
    .filter(
      (line) => line.startsWith("monitor_status{") && !line.includes("group")
    );

  const apps = statusLines.map((line) => {
    const nameMatch = line.match(/monitor_name="([^"]+)"/);
    const valueMatch = line.match(/}\s+(\d+)/);

    const dbApp = knownApps.find((app) => app.name === nameMatch?.[1]);

    if (!dbApp) {
      appsToCreate.push(nameMatch?.[1] ?? "unknown");
    } else if (dbApp.disabled) {
      return null;
    }

    return {
      name: nameMatch?.[1] ?? "unknown",
      status: valueMatch?.[1] === "1" ? "UP" : "DOWN",
      id: dbApp?.id ?? "unknown"
    };
  });

  await prisma.app.createMany({
    data: appsToCreate.map((name) => ({
      name
    }))
  });

  if (appsToCreate.length > 0) revalidatePath("/");

  return apps;
}
