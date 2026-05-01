import { NextResponse } from "next/server";
import postRepo from "@/repos/postRepo";


export async function GET(request, { params }) {
    const { id } = await params;
    const post = await postRepo.getById(id);

    if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json(post);
}

export async function PUT(request, { params }) {
    const { id } = await params;
    const body = await request.json();
    const updated = await postRepo.update(id, body);

    if (!updated) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    const success = await postRepo.deletePost(id);

    if (!success) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Post deleted" });
}
