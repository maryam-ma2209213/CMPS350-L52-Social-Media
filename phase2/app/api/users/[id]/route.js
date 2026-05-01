import { NextResponse } from "next/server";
import userRepo from "@/repos/userRepo";

export async function GET(request, { params }) {
    const { id } = await params;
    const user = await userRepo.getById(id);

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
}

export async function PUT(request, { params }) {
    const { id } = await params;
    const body = await request.json();
    const updated = await userRepo.update(id, body);

    if (!updated) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
}