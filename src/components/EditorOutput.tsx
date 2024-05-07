"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Suspense } from "react";

const Output = dynamic(
  async () => (await import("editorjs-react-renderer")).default,
  {
    ssr: false,
  }
);

const style = {
  paragraph: {
    fontSize: "0.87rem",
    lineHeight: "1.25rem",
  },
};

const renderers = {
  image: CustomImageRenderer,
  code: CustomCodeRenderer,
};

export function EditorOutput({ content }: { content: any }) {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Output
        data={content}
        style={style}
        className='text-sm'
        renderers={renderers}
      />
    </Suspense>
  );
}

function CustomImageRenderer({ data }: any) {
  const src = data.file.url;
  return (
    <div className='relative w-full min-h-[15rem]'>
      <Image
        alt='image'
        className='object-contain'
        fill
        priority={false}
        quality={75}
        src={src}
      />
    </div>
  );
}

function CustomCodeRenderer({ data }: any) {
  return (
    <pre className='bg-gray-800 rounded-md pt-4'>
      <code className='text-gray-100 text-sm'>{data.code}/</code>
    </pre>
  );
}
