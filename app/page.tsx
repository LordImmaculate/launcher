import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center mt-12 gap-4">
      <h1 className="text-3xl font-bold">shadcn/ui template</h1>
      <Link href="/auth/sign-in" className={buttonVariants()}>
        Sign In
      </Link>
    </div>
  );
}
