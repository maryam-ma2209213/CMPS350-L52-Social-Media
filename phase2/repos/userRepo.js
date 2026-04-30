//   {
//     "id": 1,
//     "username": "sara_m1",
//     "email": "sara_m1@example.com",
//     "password": "hashed_pw_1",
//     "bio": "Gym rat \ud83d\udcaa",
//     "avatar": "/media/avatars/avatar2.jpg",
//     "createdAt": "2023-11-24T00:00:00Z"
//   },
import prisma from "@/lib/prisma";
class userRepo {
    // get all users
    async getAll() {
        return await prisma.user.findMany();
    }

    // get by id
    async getById(id) {
        return await prisma.user.findUnique({ where: { id: Number(id) } })
    }
    // create new user account
    async createNewUser(data) {
        return await prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                password: data.password,
                bio: data.bio,
                avatar: data.avatar,
            }
        });
    }
    // edit
    async update(id, data) {
        return await prisma.user.update({
            where: { id: Number(id) },
            data: {
                username: data.username, bio: data.bio,
                avatar: data.avatar
            }
        })
    }

    // search for user by name
    async searchByName(query) {
        return await prisma.user.findMany({
            where: {
                username: {
                    contains: query,
                    // mode: "insensitive"
                }
            }
        })
    }

}

export default new userRepo();


// if we need it
// //delete account
//     async delete(id) {
//         return await prisma.transaction.delete({ where: { id: Number(id) } })
//     }