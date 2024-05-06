"use client";

import React, { useEffect, useRef } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { INFINITE_SCROLLING_PAGINATON_RESULTS } from "../../config";
import { Post } from "@prisma/client";
import { ExtendedPost } from "@/types/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useIntersection } from "@mantine/hooks";

const Loading = () => <Loader2 className='w-4 h-4 animate-spin' />;

const EditorOutput = dynamic(
  async () => {
    const module = await import("../../components/EditorOutput");
    return module.EditorOutput;
  },
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

const posts = [
  { id: 1, title: "post1" },
  { id: 2, title: "post2" },
  { id: 3, title: "post3" },
  { id: 4, title: "post4" },
  { id: 5, title: "post5" },
  { id: 6, title: "post64r" },
  { id: 7, title: "post1weljfnjw" },
  { id: 8, title: "post1weojnfw" },
  { id: 9, title: "posfwfwt1" },
  { id: 10, title: "posfkmwfw4t1" },
  { id: 11, title: "postfwof1" },
  { id: 12, title: "postfkwmfw1" },
];

// mock database fetch
// posts for page
// page1 - 0,2 posts
// page2 - 2,4 posts ....
const fetchPost = async (page: number) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return posts.slice((page - 1) * 2, page * 2);
};

export default function test() {
  const { data, isFetching } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const query = `/api/test?limit=${INFINITE_SCROLLING_PAGINATON_RESULTS}`;
      const { data } = await axios.get(query);
      return data as ExtendedPost[];
    },
    refetchOnWindowFocus: true,
  });

  const {
    data: postsData,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["customPosts"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetchPost(pageParam);
      return response;
    },
    getNextPageParam: (_, pages) => {
      return pages.length + 1;
    },
    initialData: {
      pages: [posts.slice(0, 2)],
      pageParams: [1],
    },
    initialPageParam: 1,
  });

  const lastPostRe = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    root: lastPostRe.current,
    threshold: 1,
  });

  useEffect(() => {
    if (entry?.isIntersecting) fetchNextPage();
  }, [entry]);

  const postss = postsData.pages.flatMap((page) => page);

  return (
    // {/* {isFetching ? (
    //   <p>Loading...</p>
    // ) : (
    //   <div>
    //     {data?.map((item) => (
    //       <div className=' grid grid-cols-3 md:grid-cols-2'>
    //         <Card>
    //           <CardHeader>
    //             <CardTitle>{item.title}</CardTitle>
    //             <CardDescription>{item.author.name}</CardDescription>
    //           </CardHeader>
    //           <CardContent className='truncate'>
    //             <EditorOutput content={item.content} />
    //           </CardContent>
    //           <CardFooter>{item.comments.length} comments</CardFooter>
    //         </Card>
    //       </div>
    //     ))}
    //   </div>
    // )} */}
    <div className=''>
      customPosts:
      {postss.map((post, index) => {
        if (index === postss.length) {
          return (
            <div
              className='h-1000 bg-black text-white'
              key={post.id}
              ref={ref}
            >
              <h1 className='text-4xl'>{post.title}</h1>
            </div>
          );
        }
        return (
          <div
            className='h-40 bg-black text-white'
            key={post.id}
          >
            <h1 className='text-4xl'>{post.title}</h1>
          </div>
        );
      })}
      <button
        onClick={() => fetchNextPage()}
        disabled={isFetchingNextPage}
      >
        {isFetchingNextPage
          ? "Loading More..."
          : (postsData.pages.length ?? 0) < 6
          ? "LoadMore"
          : "nothing to load"}
      </button>
    </div>
  );
}
