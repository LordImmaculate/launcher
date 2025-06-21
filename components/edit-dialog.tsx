import { MdEdit } from "react-icons/md";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "./ui/dialog";
import type { App } from "@prisma/client";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { readdir } from "fs/promises";
import { mkdir } from "fs/promises";
import sharp from "sharp";
import { prisma } from "@/prisma";
import { v4 as uuid } from "uuid";

export default function EditDialog({ app }: { app: App }) {
  async function editApp(formData: FormData) {
    "use server";

    const session = await auth();
    if (!session || !session.user || !session.user.id) return;

    const name = formData.get("name") as string;
    const url = formData.get("url") as string;
    const image = formData.get("image") as File;

    if (!name || !url) return;

    let newFile: string | null | boolean = null;

    if (image) {
      newFile = await uploadFile(image, session.user.id, app.id);
      if (typeof newFile != "string") return;
    }

    await prisma.app.update({
      where: { id: app.id },
      data: {
        name,
        url,
        imagePath: newFile ?? null
      }
    });

    revalidatePath("/");
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="absolute top-2 right-2 z-10 group-hover:opacity-100 opacity-0 transition-opacity duration-300"
        >
          <MdEdit />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Edit ${app.name}`}</DialogTitle>
          <DialogDescription>{`App ID: ${app.id}`}</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" action={editApp}>
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            placeholder="App Name"
            defaultValue={app.name}
            className="mb-4"
            required
          />
          <Label htmlFor="url">URL</Label>
          <Input
            type="text"
            id="url"
            name="url"
            placeholder="App URL"
            defaultValue={app.url ?? ""}
            className="mb-4"
            required
          />
          <Label htmlFor="image">Image</Label>
          <Input id="image" type="file" name="image" accept="image/*" />
          <Button type="submit">Edit</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export async function uploadFile(image: File, userId: string, id: string) {
  if (!image || !id || !userId) {
    return false;
  }

  const arrayBuffer = await image.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const oldImage = await prisma.app.findUnique({
    where: { id },
    select: { imagePath: true }
  });

  const directoryPath = `./public/uploads/${userId}`;
  const unique = uuid();

  const filePath = `./public/uploads/${userId}/${unique}`;
  const publicPath = `/uploads/${userId}/${unique}`;

  const dirExists = await readdir(directoryPath).catch(() => false);
  if (!dirExists) {
    mkdir(directoryPath, { recursive: true });
  }

  try {
    await sharp(buffer).webp({ quality: 80 }).toFile(`${filePath}.webp`);
    Bun.file(`${oldImage}.webp`).delete();

    return `${publicPath}.webp`;
  } catch (error) {
    console.error("Sharp conversion error:", error);

    return false;
  }
}
