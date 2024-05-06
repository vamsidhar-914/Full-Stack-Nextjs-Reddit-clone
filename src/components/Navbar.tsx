import Link from "next/link";
import { Icons } from "./Icons";
import { buttonVariants } from "./ui/Button";
import { getServerSession } from "next-auth";
import { getAuthSession } from "@/lib/auth";
import { UserAccount } from "./UserAccount";

export async function Navbar() {
  const session = await getAuthSession();

  return (
    <div className='fixed top-0 inset-x-0 h-fit bg-zinc-100 border border-zinc-300 z-[10] py-2'>
      <div className='container max-w-7xl h-full mx-auto flex items-center justify-between gap-2'>
        {/* logo  */}
        <a
          href='/'
          className='flex gap-2 items-center'
        >
          <Icons.logo className='h-8 w-8 sm:h-6 sm:w-6' />
          <p className='hidden text-zinc-700 text-md font-medium md:block'>
            Bredittt
          </p>
        </a>
        {/* Search bar */}

        {session?.user ? (
          <UserAccount user={session.user} />
        ) : (
          <Link
            href='/sign-in'
            className={buttonVariants()}
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
