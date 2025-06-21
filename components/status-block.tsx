import { Button } from "./ui/button";
import Image from "next/image";
import EditDialog from "./edit-dialog";
import type { App } from "@prisma/client";

export default async function StatusBlock({
  app,
  userId
}: {
  app: App | null;
  userId: string;
}) {
  if (!app) return null;

  return (
    <Button asChild variant="outline" className="h-36 w-36 relative group">
      <div>
        <EditDialog app={app} />
        <a
          href={app.url ?? "/"}
          target={app.url ? "_blank" : ""}
          rel="noopener noreferrer"
        >
          <Image
            src={app.imagePath ?? "/placeholder.svg"}
            alt={app.name}
            width={200}
            height={200}
            className="rounded-2xl p-2"
          />
        </a>
      </div>
    </Button>
  );
}
