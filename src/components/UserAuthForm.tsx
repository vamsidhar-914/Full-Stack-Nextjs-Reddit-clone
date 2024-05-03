"use client";

import { cn } from "@/lib/utils";
import { Button } from "./ui/Button";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Icons } from "./Icons";
import { useToast } from "@/hooks/use-toast";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsloading] = useState<boolean>(false);
  const { toast } = useToast();
  const loginWithGoogle = async () => {
    setIsloading(true);
    try {
      await signIn("google");
    } catch (err) {
      // toast notification if error occurs
      toast({
        title: "There was a problem",
        description: "There was an error logging in with google",
        variant: "destructive",
      });
    } finally {
      setIsloading(false);
    }
  };
  return (
    <div
      className={cn("flex justify-center", className)}
      {...props}
    >
      <Button
        onClick={loginWithGoogle}
        isLoading={isLoading}
        size='sm'
        className='w-full'
      >
        {isLoading ? null : <Icons.google className='h-4 w-4 mr-1  mb-1' />}
        Google
      </Button>
      ;
    </div>
  );
}
