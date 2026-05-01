import { NextResponse } from "next/server";
import followsRepo from "@/repos/followsRepo";

export async function GET(request) {

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");

    if (!userId || !type) {
        return NextResponse.json(
            { error: "userId and type is required" },
            { status: 400 }
        );
    }

    let result;

    if (type === "followers") {
        result = await followsRepo.getFollowers(userId);
    } else if (type === "following") {
        result = await followsRepo.getFollowing(userId);
    } else {
        return NextResponse.json(
            { error: "type must be 'followers' or 'following'" },
            { status: 400 }
        );
    }
    return NextResponse.json(result);
}

export async function POST(request) {
    const body = await request.json();


    if (!body.followerId || !body.followingId) {
        return NextResponse.json(
            { error: "followerId and followingId is required." },
            { status: 400 }
        );
    }

    const result = await followsRepo.toggleFollow(body.followerId, body.followingId);
    return NextResponse.json(result);
}