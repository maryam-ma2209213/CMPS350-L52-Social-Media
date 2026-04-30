//  {
//     "id": 1,
//     "caption": "Study grind never stops \ud83d\udcda",
//     "image": "/media/posts/post2.jpg",
//     "authorId": 1,
//     "createdAt": "2024-02-27T11:00:00Z"
//   },
import prisma from "@/lib/prisma";
class postRepo {
    // get all posts
    async getAll() {
        return await prisma.post.findMany();
    }

    // get post by id
    async getById(id) {
        return await prisma.post.findUnique({
            where: { id: Number(id) }, include: {
                comments: true,
                likes: true,
            }
        })
    }
    // create new post
    async createNewPost(data) {
        return await prisma.post.create({
            data: {
                caption: data.caption,
                image: data.image,
                authorId: data.authorId,
            }
        });
    }
    // edit post
    async update(id, data) {
        return await prisma.post.update({
            where: { id: Number(id) },
            data: {
                caption: data.caption,
                image: data.image,
            }
        })
    }
    //delete post
    async deletePost(id) {
        return await prisma.post.delete({ where: { id: Number(id) } })
    }

}

export default new postRepo();


