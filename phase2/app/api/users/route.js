import { NextResponse } from "next/server";
import userRepo from "@/repos/userRepo";

export async function GET(request) {
    const { searchParams } = new URL(request.url);

    const username = searchParams.get("username");
    const search = searchParams.get("search");
    const email = searchParams.get("email");
    if (email) {
    const users = await userRepo.getByEmail(email);
    return NextResponse.json(users);
}
    if (search) {
        const users = await userRepo.searchByName(search);
        return NextResponse.json(users);
    }

    let users = await userRepo.getAll();
    if (username) {
        users = users.filter(u => u.username === username);
    }

    return NextResponse.json(users);
}

export async function POST(request) {
    const body = await request.json();

    if (!body.username || !body.email || !body.password) {
        return NextResponse.json(
            { error: "username, email, and password are required." },
            { status: 400 }
        );
    }

    const newUser = await userRepo.createNewUser(body);
    return NextResponse.json(newUser, { status: 201 });
}