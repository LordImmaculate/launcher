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

export default function AppDialog({
  app,
  trigger,
  type
}: {
  app?: App;
  trigger: React.ReactNode;
  type: "edit" | "create";
}) {
  const editing = type === "edit";
  if (editing && !app) throw new Error("App is required for editing");

  async function appHandling(formData: FormData) {
    "use server";

    const session = await auth();
    if (!session || !session.user || !session.user.id) return;

    const name = formData.get("name") as string;
    const url = formData.get("url") as string;
    const image = formData.get("image") as File;

    if (!name || !url) return;

    let newFile: string | null | boolean = null;

    let appID = app?.id ?? "";

    if (!editing || !app) {
      const newApp = await prisma.app.create({
        data: {
          name,
          url,
          imagePath: newFile ?? null
        }
      });

      appID = newApp.id;
    }

    if (image) {
      newFile = await uploadFile(image, session.user.id, appID);
      if (typeof newFile != "string") return;
    }

    await prisma.app.update({
      where: { id: appID },
      data: {
        name,
        url,
        imagePath: newFile ?? null
      }
    });

    revalidatePath("/");
  }

  async function deleteApp() {
    "use server";

    if (!app) return;

    const oldImage = await prisma.app.findUnique({
      where: { id: app.id },
      select: { imagePath: true }
    });

    if (oldImage?.imagePath) {
      Bun.file(`./public${oldImage.imagePath}.webp`).delete();
    }

    await prisma.app.delete({ where: { id: app.id } });
    revalidatePath("/");
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${app?.name}` : "Create"}</DialogTitle>
          <DialogDescription>
            {app ? `App ID: ${app.id}` : "Create a new app"}
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" action={appHandling}>
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            placeholder="App Name"
            defaultValue={app?.name}
            className="mb-4"
            required
          />
          <Label htmlFor="url">URL</Label>
          <Input
            type="text"
            id="url"
            name="url"
            placeholder="App URL"
            defaultValue={app?.url ?? ""}
            className="mb-4"
            required
          />
          <Label htmlFor="image">Image</Label>
          <Input id="image" type="file" name="image" accept="image/*" />
          <Button type="submit">{editing ? "Edit" : "Create"}</Button>
        </form>
        {editing ? (
          <form action={deleteApp}>
            <Button className="w-full" type="submit" variant="destructive">
              Delete
            </Button>
          </form>
        ) : null}
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

    if (oldImage?.imagePath)
      Bun.file(`./public${oldImage?.imagePath}.webp`).delete();

    return `${publicPath}.webp`;
  } catch (error) {
    console.error("Sharp conversion error:", error);

    return false;
  }
}
