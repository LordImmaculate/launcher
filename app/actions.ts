// app/actions.ts or app/some-component/page.tsx
"use server";

import { revalidatePath } from "next/cache"; // For cache revalidation
import sharp from "sharp";
import { auth } from "@/auth";
import { readdir, mkdir } from "node:fs/promises";

export async function uploadFile(image: File, id: string) {
  const session = await auth();
  if (!session) {
    return { success: false, message: "Unauthorized" };
  }

  const userId = session.user?.id;

  if (!image || !id || !userId) {
    return { success: false, message: "No image uploaded." };
  }

  const arrayBuffer = await image.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const directoryPath = `./public/uploads/${userId}`;
  const filePath = `./public/uploads/${userId}/${id}`;

  const dirExists = await readdir(directoryPath).catch(() => false);
  if (!dirExists) {
    mkdir(directoryPath, { recursive: true });
  }

  try {
    await sharp(buffer).webp({ quality: 80 }).toFile(`${filePath}.webp`);

    revalidatePath("/");

    return { success: true, message: "Image uploaded" };
  } catch (error) {
    console.error("Sharp conversion error:", error);
    return { success: false, message: "Image upload failed" };
  }
}
