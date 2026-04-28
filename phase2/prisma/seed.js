import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

async function readJson(name) {
  const file = path.join(process.cwd(), "data", name);
  return JSON.parse(await fs.readFile(file, "utf-8"));
}

async function seed(name, model, items) {
  try {
    const existing = await model.findMany();
    if (existing.length > 0) {
      console.log(`Skipped ${name} - already has ${existing.length} rows`);
      return;
    }

    for (const item of items) {
      await model.create({ data: item });
    }

    console.log(`Seeded ${items.length} ${name}`);
  } catch (e) {
    throw e;
  }
}

async function main() {
  const users = await readJson("users.json");
  await seed("users", prisma.user, users);

  const posts = (await readJson("posts.json")).map(
    ({ id, authorId, createdAt, ...rest }) => ({
      ...rest,
      createdAt: new Date(createdAt),
      author: {
        connect: { id: authorId },
      },
    })
  );
  await seed("posts", prisma.post, posts);

  const rawComments = await readJson("comments.json");

  const createdComments = [];

  for (const { id, authorId, postId, parentId, createdAt, ...rest } of rawComments) {
    const comment = await prisma.comment.create({
      data: {
        ...rest,
        createdAt: new Date(createdAt),
        author: { connect: { id: authorId } },
        post: { connect: { id: postId } },
      },
    });

    createdComments.push({
      originalId: id,
      dbId: comment.id,
      parentId,
    });
  }

  for (const c of createdComments) {
    if (c.parentId) {
      const parent = createdComments.find(
        (x) => x.originalId === c.parentId
      );

      if (parent) {
        await prisma.comment.update({
          where: { id: c.dbId },
          data: {
            parent: {
              connect: { id: parent.dbId },
            },
          },
        });
      }
    }
  }

  const likes = (await readJson("likes.json")).map(
    ({ userId, postId }) => ({
      user: { connect: { id: userId } },
      post: { connect: { id: postId } },
    })
  );
  await seed("likes", prisma.like, likes);

  const follows = (await readJson("follows.json")).map(
    ({ followerId, followingId }) => ({
      follower: { connect: { id: followerId } },
      following: { connect: { id: followingId } },
    })
  );
  await seed("follows", prisma.follow, follows);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });