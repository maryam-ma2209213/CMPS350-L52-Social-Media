import prisma from "@/lib/prisma";

const statsRepo = {
async mostActiveUser() {
    const result = await prisma.post.groupBy({
      by: ["authorId"],
      _count: {
        authorId: true
      },
      orderBy: {
        _count: {
          authorId: "desc"
        }
      },
      take: 1
    });
    
    if (!result.length) return null;
    const user = await prisma.user.findUnique({
        where: {
            id: result[0].authorId
        }
    });
    if (!user) return null;
    return{
        username: user.username,
        posts: result[0]._count.authorId
    };
},

async totalUsers(){
    return await prisma.user.count();
},

async totalPosts(){
    return await prisma.post.count();
},

async totalComments(){
    return await prisma.comment.count();
},

async mostLikedPost(){
    const result = await prisma.like.groupBy({
        by: ["postId"],
        _count:{
            postId: true
        },
        orderBy:{
            _count:{
                postId: "desc"
            }
        },
        take: 1
    });
    if (!result.length) return null;
    const post = await prisma.post.findUnique({
        where:{
            id: result[0].postId
        },
        include:{
            author: {
                select:{
                    username: true
                }
            }
        },
    });
    if(!post) return null;
    return {
        content: post.content,
        author: post.author.username,
        likes: result[0]._count.postId
    };
},

async averageFollowers(){
    const result = await prisma.follow.groupBy({
        by:["followingId"],
        _count:{
            followerId: true
        }
    });
    if (!result.length) return null;
    const total = result.reduce((sum,r) => sum+r._count.followerId,0);
    return (total/result.length).toFixed(1);
    }
};

export default statsRepo;