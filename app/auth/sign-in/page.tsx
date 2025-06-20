import { auth } from "@/auth";
import SignInGoogle from "@/components/sign-in-google";
import { redirect } from "next/navigation";

export default async function SignIn() {
  const session = await auth();

  if (session) return redirect("/");

  return (
    <div className="flex flex-col items-center mt-12">
      <h1 className="text-3xl">Sign In</h1>
      <p className="text-sm text-muted-foreground">
        Please sign in to continue
      </p>
      <div className="mt-4">
        <SignInGoogle />
      </div>
    </div>
  );
}
