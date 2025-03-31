import { GetUserByClerkId } from "@/utils/user";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export const GET = async (req: NextRequest) => {
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

    // Fetch the user's accepted friends (where isAccepted is not null)
    const friends = await prisma.friend.findMany({
        where: {
            OR: [
                { sender_id: user.id, isAccepted: { not: null } },
                { reciever_id: user.id, isAccepted: { not: null } }
            ]
        },
        include: {
            sender: {
                select: {
                    id: true,
                    username: true,
                    image_url: true,
                    name: true,
                    phone_number: true
                }
            },
            reciever: {
                select: {
                    id: true,
                    username: true,
                    image_url: true,
                    name: true,
                    phone_number: true
                }
            }
        }
    });

    // Format the response
    const formattedFriends = friends.map(friend => {
        if (friend.sender_id === user.id) {
            return friend.reciever; // Return reciever info if the user is the sender
        } else {
            return friend.sender; // Return sender info if the user is the receiver
        }
    });

    return NextResponse.json({
        success: true,
        data: formattedFriends
    }, { status: 200 });
};
