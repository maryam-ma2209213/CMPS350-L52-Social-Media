import { NextResponse } from "next/server";
import userRepo from "@/repos/userRepo";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET(request, { params }) {
    const { id } = await params;
    const user = await userRepo.getById(id);

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const contentType = request.headers.get("content-type") || "";

        let username, bio, avatar, gender;

        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            username = formData.get("username");
            bio = formData.get("bio");
            gender = formData.get("gender");
            const file = formData.get("avatar");

            if (file && file.size > 0) {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const filename = `${Date.now()}_${file.name.replace(/\s/g, "_")}`;
                const uploadDir = path.join(process.cwd(), "public", "media", "avatars");
                await mkdir(uploadDir, { recursive: true });
                await writeFile(path.join(uploadDir, filename), buffer);
                avatar = `/media/avatars/${filename}`;
            }
        } else {
            const body = await request.json();
            username = body.username;
            bio = body.bio;
            avatar = body.avatar;
            gender = body.gender;
        }

        const updated = await userRepo.update(id, { username, bio, avatar, gender });

        if (!updated) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(updated);

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
    }
}