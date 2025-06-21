"use client";

import { useState } from "react";
import { uploadFile } from "@/app/actions"; // Adjust path as needed
import { Button } from "@/components/ui/button";

export default function UploadForm({ id }: { id: string }) {
  const [message, setMessage] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setMessage("Uploading...");
    const image = formData.get("file") as File;
    const result = await uploadFile(image, id);
    setMessage(result.message);
  };

  return (
    <form action={handleSubmit}>
      <input type="file" name="file" required />
      <Button type="submit">Upload</Button>
      {message && <p>{message}</p>}
    </form>
  );
}
