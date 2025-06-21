import { Button } from "./ui/button";
import { MdEdit } from "react-icons/md";
import Image from "next/image";

type service = {
  name: string;
  status: string;
  id: string;
};

export default async function StatusBlock({
  service,
  userId
}: {
  service: service | null;
  userId: string;
}) {
  if (!service) return null;

  const imageExists = await Bun.file(
    `./public/uploads/${userId}/${service.id}.webp`
  ).exists();

  return (
    <Button asChild variant="outline" className="h-36 w-36 relative group">
      <div>
        <Button
          size="icon"
          className="absolute top-2 right-2 z-10 group-hover:opacity-100 opacity-0 transition-opacity duration-300"
        >
          <MdEdit />
        </Button>
        <a href="https://google.com" target="_blank" rel="noopener noreferrer">
          <Image
            src={
              imageExists
                ? `/uploads/${userId}/${service.id}.webp`
                : "/placeholder.svg"
            }
            alt={service.name}
            width={200}
            height={200}
            className="rounded-md p-2"
          />
        </a>
      </div>
    </Button>
  );
}
