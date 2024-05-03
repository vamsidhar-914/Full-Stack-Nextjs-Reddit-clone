import Link from "next/link";
import { toast } from "./use-toast";
import { buttonVariants } from "@/components/ui/Button";

export const useCustomToast = () => {
  const loginToast = () => {
    const { dismiss } = toast({
      title: "login required",
      description: "you need to be login to create a subreddit",
      variant: "destructive",
      action: (
        <Link
          href='/sign-in'
          onClick={() => dismiss()}
          className={buttonVariants({
            variant: "outline",
          })}
        >
          Login
        </Link>
      ),
    });
  };
  return { loginToast };
};
