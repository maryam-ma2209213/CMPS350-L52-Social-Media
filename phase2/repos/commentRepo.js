//  {
//     "id": 1,
//     "content": "Which song?",
//     "authorId": 76,
//     "postId": 1,
//     "parentId": null,
//     "createdAt": "2024-02-27T20:40:00Z"
//   },
import prisma from "@/lib/prisma";
class commentRepo {
    // get comments by postId
    async getAllByPost(postId) {
        return await prisma.comment.findMany({
            where: { postId: Number(postId) },
            include: {
                replies: true
            }
        })
    }
    // create new post
    async createNewComment(data) {
        return await prisma.comment.create({
            data: {
                content: data.content,
                authorId: data.authorId,
                postId: data.postId,
                parentId: data.parentId || null
            }
        });
    }
    //delete comment
    async deleteComment(id) {
        return await prisma.comment.delete({ where: { id: Number(id) } })
    }

}

export default new commentRepo();