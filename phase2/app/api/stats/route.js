import { NextResponse } from "next/server";
import statsRepo from "@/repos/statsRepo";

export async function GET(){
    try{
    const data = await Promise.all([
        statsRepo.averageFollowers(),
        statsRepo.mostActiveUser(),
        statsRepo.mostLikedPost(),
        statsRepo.totalComments(),
        statsRepo.totalPosts(),
        statsRepo.totalUsers()
    ]);
    return NextResponse.json({
        averageFollowers: data[0],
        mostActiveUser: data[1],
        mostLikedPost: data[2],
        totalComments: data[3],
        totalPosts: data[4],
        totalUsers: data[5],
    });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}