//  {
//     "id": 1,
//     "followerId": 5,
//     "followingId": 55,
//     "createdAt": "2024-02-27T00:00:00Z"
//   },
import prisma from "@/lib/prisma";
class followRepo {
    // who follows the person
    async getFollowers(userId) {
        return await prisma.follow.findMany({
            where: { followingId: Number(userId) },
            include: { follower: true }
        })
    }
    // who the person is following
    async getFollowing(userId) {
        return await prisma.follow.findMany({
            where: { followerId: Number(userId) },
            include: { following: true }
        })
    }

    // add/remove follow similar to toggle same as like
    async toggleFollow(followerId, followingId) {
        // find if the person follows or not and if yes save id of follow
        const exist = await prisma.follow.findFirst({
            where: {
                followerId: Number(followerId),
                followingId: Number(followingId)
            }
        });
        // if following before then remove
        if (exist) {
            return await prisma.follow.delete({
                where: { id: Number(exist.id) }
            });
            // if person is not following then add follow
        } else {
            return await prisma.follow.create({
                data: {
                    followerId: Number(followerId),
                    followingId: Number(followingId)
                }
            })
        }
    }

}

export default new followRepo();