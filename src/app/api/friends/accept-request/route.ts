import prisma from "@/utils/prisma";
import { GetFriendRequestById, GetUserByClerkId } from "@/utils/user";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    // TODO: BOT Protection
    const { userId } = await auth();
    const user = await GetUserByClerkId(userId!);

    if (!userId || !user) {
        return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }

    const request_id = req.nextUrl.searchParams.get("id");
    if (!request_id) {
        return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }

    const request = await GetFriendRequestById(request_id);
    if (!request) {
        return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }

    // Ensure only the receiver can accept the request
    if (request.reciever_id !== user.id) {
        return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }

    // Accept the friend request
    const accepted_request = await prisma.friend.update({
        where: {
            id: request_id,
            AND: [
                { reciever_id: user.id },
                { sender_id: request.sender_id },
                { isAccepted: null } // Ensure it's a pending request
            ]
        },
        data: {
            isAccepted: new Date(),
        }
    });

    // Create a new chat and link both users
    const new_chat = await prisma.chat.create({
        data: {
            friendId: accepted_request.id,
            users: {
                connect: [
                    { id: accepted_request.sender_id },
                    { id: accepted_request.reciever_id }
                ]
            }
        },
        include: {
            users: {
                select: {
                    image_url: true,
                    username: true,
                    name: true,
                    phone_number: true
                }
            }
        }
    });

    return NextResponse.json({ success: true, data: new_chat }, { status: 200 });
};
