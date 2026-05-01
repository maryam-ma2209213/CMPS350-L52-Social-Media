import { NextResponse } from "next/server";
import postRepo from "@/repos/postRepo";

export async function GET(request) {
    let posts = await postRepo.getAll();

    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get("authorId");

    if (authorId) posts = posts.filter(p => p.authorId === Number(authorId));

    return NextResponse.json(posts);
}

export async function POST(request) {
    const body = await request.json();

    if (!body.caption || !body.authorId) {
        return NextResponse.json(
            { error: "caption, and authorId is required." },
            { status: 400 }
        );
    }

    const newPost = await postRepo.createNewPost(body);
    return NextResponse.json(newPost, { status: 201 });
}
