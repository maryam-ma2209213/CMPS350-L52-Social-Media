//  {
//     "id": 2,
//     "userId": 11,
//     "postId": 25,
//     "createdAt": "2024-04-15T02:43:00Z"
//   },
import prisma from "@/lib/prisma";
class likeRepo {
  // get likes by postId
  async getLikesByPost(postId) {
    return await prisma.like.findMany({
      where: { postId: Number(postId) },
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });
  }

  // add/remove likes (toggle)
  async toggleLike(postId, userId) {
    const exist = await prisma.like.findFirst({
      where: { postId: Number(postId), userId: Number(userId) },
    });

    if (exist) {
      await prisma.like.delete({ where: { id: Number(exist.id) } });
      return { liked: false };
    } else {
      await prisma.like.create({
        data: {
          postId: Number(postId),
          userId: Number(userId),
        },
      });
      return { liked: true };
    }
  }
}

export default new likeRepo();
