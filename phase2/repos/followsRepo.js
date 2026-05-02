import prisma from "@/lib/prisma";
class followRepo {
  // who follows the person
  async getFollowers(userId) {
    return await prisma.follow.findMany({
      where: { followingId: Number(userId) },
      include: {
        follower: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });
  }

  // who the person is following
  async getFollowing(userId) {
    return await prisma.follow.findMany({
      where: { followerId: Number(userId) },
      include: {
        following: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });
  }

  // add/remove follow (toggle)
  async toggleFollow(followerId, followingId) {
    const exist = await prisma.follow.findFirst({
      where: {
        followerId: Number(followerId),
        followingId: Number(followingId),
      },
    });

    if (exist) {
      await prisma.follow.delete({ where: { id: Number(exist.id) } });
      return { following: false };
    } else {
      await prisma.follow.create({
        data: {
          followerId: Number(followerId),
          followingId: Number(followingId),
        },
      });
      return { following: true };
    }
  }
}

export default new followRepo();
