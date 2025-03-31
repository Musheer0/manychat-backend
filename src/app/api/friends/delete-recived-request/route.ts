import { GetUserByClerkId } from "@/utils/user";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export const DELETE = async (req: NextRequest) => {
    // Authenticate the user
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data from the database using the Clerk ID
    const user = await GetUserByClerkId(userId);
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    // Get the friend request ID from the query parameters
    const request_id = req.nextUrl.searchParams.get("id");
    if (!request_id) {
        return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }

    // Find the friend request from the database by ID
    const request = await prisma.friend.findUnique({
        where: { id: request_id },
    });

    if (!request) {
        return NextResponse.json({ error: "Friend request not found" }, { status: 400 });
    }

    // Check if the current user is the receiver of the friend request
    if (request.reciever_id !== user.id) {
        return NextResponse.json({ error: "This is not your request" }, { status: 400 });
    }

    // Ensure that the request is pending (not accepted)
    if (request.isAccepted !== null) {
        return NextResponse.json({ error: "Cannot delete accepted request" }, { status: 400 });
    }

    // Delete the friend request (only if it's pending)
    await prisma.friend.delete({
        where: { id: request_id },
    });

    return NextResponse.json({ success: true, message: "Friend request deleted" }, { status: 200 });
};
