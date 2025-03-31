import { GetUserById, SendFriendRequest, GetUserByClerkId } from "@/utils/user";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    // TODO: Add bot protection
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the user's database ID from Clerk ID
    const sender = await GetUserByClerkId(userId);
    if (!sender) {
        return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    const friend_id = req.nextUrl.searchParams.get("id");
    if (!friend_id) {
        return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }

    // Ensure sender is not sending a request to themselves
    if (friend_id === sender.id) {
        return NextResponse.json({ error: "You cannot send a friend request to yourself" }, { status: 400 });
    }

    // Fetch the recipient's details
    const friend = await GetUserById(friend_id);
    if (!friend) {
        return NextResponse.json({ error: "Friend not found" }, { status: 404 });
    }

    // Send friend request
    const request = await SendFriendRequest({
        sender: sender.id,  // Use database ID, not Clerk ID
        reciever: friend.id
    });

    return NextResponse.json({
        success: true,
        data: {
            reciever: {
                username: friend.username,
                image_url: friend.image_url,
                phone_number: friend.phone_number,
                name: friend.name
            },
            friend_request_id: request?.id
        }
    }, { status: 200 });
};
