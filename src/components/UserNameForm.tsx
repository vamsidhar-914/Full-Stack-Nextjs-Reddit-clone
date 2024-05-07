"use client";

import { UsernameValid, UsernameValidator } from "@/lib/validators/username";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import { useCustomToast } from "@/hooks/useCustomToast";
import { useRouter } from "next/navigation";

type UserProps = {
  user: Pick<User, "id" | "username">;
};

export function UserNameForm({ user }: UserProps) {
  const { loginToast } = useCustomToast();
  const router = useRouter();
  // react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UsernameValid>({
    resolver: zodResolver(UsernameValidator),
    defaultValues: {
      name: user?.username || "",
    },
  });

  const { mutate: updateUsername, isPending } = useMutation({
    mutationFn: async ({ name }: UsernameValid) => {
      const payload: UsernameValid = {
        name,
      };
      const { data } = await axios.patch("/api/settings", payload);
      return data as UsernameValid;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: "username already exists",
            description: "choose a different username",
            variant: "destructive",
          });
        }
      }
      return toast({
        title: "something went wrong",
        description: "please try again later",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        description: "username has been updated",
      });
      router.refresh();
    },
  });

  return (
    <form
      onSubmit={handleSubmit((e) => {
        updateUsername(e);
      })}
    >
      <Card>
        <CardHeader>
          <CardTitle>Your username</CardTitle>
          <CardDescription>
            Please enter a display name you are comfortable with..
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='relative grid gap-1'>
            <div className='absolute top-0 let-0 w-8  h-10 grid place-items-center'>
              <span className='text-sm text-zinc-400'>u/</span>
            </div>
            <Label
              className='sr-only'
              htmlFor='name'
            >
              Name
            </Label>
            <Input
              id='name'
              className='w=[400px] pl-6'
              size={32}
              {...register("name")}
            />
          </div>
          {errors?.name && (
            <p className='px-1 tetx-xs text-red-600'>{errors.name.message}</p>
          )}
        </CardContent>
        <CardFooter>
          <Button isLoading={isPending}>Change username</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
0;
