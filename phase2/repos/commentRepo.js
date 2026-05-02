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
        author: {
          select: { id: true, username: true, avatar: true },
        },
        replies: {
          include: {
            author: {
              select: { id: true, username: true, avatar: true },
            },
          },
        },
      },
    });
  }

  // create new comment
  async createNewComment(data) {
    return await prisma.comment.create({
      data: {
        content: data.content,
        authorId: data.authorId,
        postId: data.postId,
        parentId: data.parentId || null,
      },
      include: {
        author: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });
  }

  // delete comment
  async deleteComment(id) {
    return await prisma.comment.delete({ where: { id: Number(id) } });
  }
}

export default new commentRepo();
