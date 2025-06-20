import { Atom } from "lucide-react";
import { buttonVariants } from "./ui/button";
import Link from "next/link";
import ThemeToggle from "./theme-toggle";
import { auth } from "@/auth";

export default async function Header() {
  const session = await auth();

  return (
    <header className="flex items-center justify-between p-4">
      <Link href="/" className="flex flex-row items-center gap-1">
        <Atom />
        <h1 className="text-3xl">Acme</h1>
      </Link>
      <div className="flex items-center gap-4">
        {!session ? (
          <Link
            href="/auth/sign-in"
            className={buttonVariants({ variant: "outline" })}
          >
            Sign In
          </Link>
        ) : null}
        <ThemeToggle />
      </div>
    </header>
  );
}
