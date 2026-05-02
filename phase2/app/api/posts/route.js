import { NextResponse } from "next/server";
import postRepo from "@/repos/postRepo";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET(request) {
    let posts = await postRepo.getAll();

    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get("authorId");

    if (authorId) posts = posts.filter(p => p.authorId === Number(authorId));

    return NextResponse.json(posts);
}

export async function POST(request) {
    try {
        const contentType = request.headers.get("content-type") || "";

        let caption = null;
        let authorId = null;
        let imagePath = null;

        if (contentType.includes("multipart/form-data")) {
            // Handle file upload
            const formData = await request.formData();
            caption = formData.get("caption") || null;
            authorId = formData.get("authorId");
            const file = formData.get("image");

            if (file && file.size > 0) {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const filename = `${Date.now()}_${file.name.replace(/\s/g, "_")}`;
                const uploadDir = path.join(process.cwd(), "public", "media", "posts");
                await mkdir(uploadDir, { recursive: true });
                await writeFile(path.join(uploadDir, filename), buffer);
                imagePath = `/media/posts/${filename}`;
            }
        } else {
            // Handle JSON (no file)
            const body = await request.json();
            caption = body.caption || null;
            authorId = body.authorId;
            imagePath = body.image || null;
        }

        if (!authorId) {
            return NextResponse.json({ error: "authorId is required." }, { status: 400 });
        }

        if (!caption && !imagePath) {
            return NextResponse.json({ error: "Please add a caption or image." }, { status: 400 });
        }

        const newPost = await postRepo.createNewPost({
            caption,
            image: imagePath,
            authorId: Number(authorId),
        });

        return NextResponse.json(newPost, { status: 201 });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to create post." }, { status: 500 });
    }
}