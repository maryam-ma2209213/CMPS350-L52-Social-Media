import { NextResponse } from "next/server";
import commentRepo from "@/repos/commentRepo";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId) {
        return NextResponse.json(
            { error: "postId is required" },
            { status: 400 }
        );
    }

    const comments = await commentRepo.getAllByPost(postId);
    return NextResponse.json(comments);
}

export async function POST(request) {
    try {
        const body = await request.json();

        if (!body.postId || !body.authorId || !body.content) {
            return NextResponse.json(
                { error: "content, postId, and authorId are required." },
                { status: 400 }
            );
        }

        const newComment = await commentRepo.createNewComment(body);

        return NextResponse.json(newComment, { status: 201 });

    } catch (error) {
        console.log("POST COMMENT ERROR:", error);

        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "id is required" },
            { status: 400 }
        );
    }

    const success = await commentRepo.deleteComment(id);

    if (!success) {
        return NextResponse.json(
            { error: "Comment not found" },
            { status: 404 }
        );
    }

    return NextResponse.json({ message: "Comment deleted" });
}