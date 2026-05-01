import { NextResponse } from "next/server";
import likeRepo from "@/repos/likeRepo";

export async function GET(request) {

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId) {
        return NextResponse.json(
            { error: "postId is required" },
            { status: 400 }
        );
    }

    const likes = await likeRepo.getLikesByPost(postId);
    return NextResponse.json(likes);
}

export async function POST(request) {
    const body = await request.json();


    if (!body.postId || !body.userId) {
        return NextResponse.json(
            { error: "postId, and userId is required." },
            { status: 400 }
        );
    }

    const newLike = await likeRepo.toggleLike(body.postId, body.userId);
    return NextResponse.json(newLike);
}