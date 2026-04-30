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
            include: { user: true }
        })
    }
    // add/remove likes so toggle

    async toggleLike(postId, userId) {
        // find if the person liked before or not and if yes save id
        const exist = await prisma.like.findFirst({
            where: { postId: Number(postId), userId: Number(userId) }
        });
        // if liked before then remove
        if (exist) {
            return await prisma.like.delete({
                where: { id: Number(exist.id) }
            });
            // if person has not liked then add like
        } else {
            return await prisma.like.create({
                data: {
                    postId: Number(postId),
                    userId: Number(userId)
                }
            })
        }
    }

}

export default new likeRepo();