import { Button } from "./ui/button";
import Image from "next/image";
import AppDialog from "./app-dialog";
import type { App } from "@prisma/client";
import { MdEdit } from "react-icons/md";

export default async function StatusBlock({ app }: { app: App | null }) {
  if (!app) return null;

  const trigger = (
    <Button
      size="icon"
      className="absolute top-2 right-2 z-10 group-hover:opacity-100 opacity-0 transition-opacity duration-300"
    >
      <MdEdit />
    </Button>
  );

  return (
    <Button asChild variant="outline" className="h-36 w-36 relative group">
      <div>
        <AppDialog app={app} trigger={trigger} type="edit" />
        <a
          href={app.url ?? "/"}
          target={app.url ? "_blank" : ""}
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center h-full w-full"
        >
          <Image
            src={app.imagePath ?? "/placeholder.svg"}
            alt={app.name}
            width={200}
            height={200}
            className="rounded-2xl p-2"
          />
          <span className="absolute bottom-1 group-hover:opacity-100 opacity-0 transition-opacity duration-300 text-center text-sm">
            {app.name}
          </span>
        </a>
      </div>
    </Button>
  );
}
