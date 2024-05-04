import { db } from "@/lib/db";

async function getAllPosts() {
  await wait(2000);
  return db.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      votes: true,
      author: true,
      comments: true,
      subreddit: true,
    },
  });
}

export async function HomePage() {
  const allPosts = await getAllPosts();
  return (
    <div className=''>
      {allPosts.map((item) => (
        <h1 key={item.id}>{item.title}</h1>
      ))}
    </div>
  );
}

function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
