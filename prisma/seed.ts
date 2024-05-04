import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// delete users
async function createUsers() {
  await prisma.user.deleteMany();
  return;
}

//delete Posts
async function createTodos() {
  await prisma.post.deleteMany();
  return;
}

// delete subreddit
async function createPosts() {
  await prisma.subreddit.deleteMany();
  return;
}

// delete subscription
async function createComments() {
  await prisma.subscription.deleteMany();
}

// delete vote
async function deleteVote() {
  await prisma.vote.deleteMany();
}

//delete comment
async function deleteComment() {
  await prisma.comment.deleteMany();
  return;
}

async function commentVote() {
  await prisma.commentVote.deleteMany();
  return;
}

//delete commentVOte

async function main() {
  await createUsers();
  await createTodos();
  await createPosts();
  await createComments();
  await deleteVote();
  await deleteComment();
  await commentVote();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
