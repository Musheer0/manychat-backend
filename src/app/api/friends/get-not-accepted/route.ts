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

    // Fetch the user's pending friend requests (where isAccepted is null)
    const pendingRequests = await prisma.friend.findMany({
        where: {
           AND:[
            {reciever_id: user.id},
            { isAccepted: null }
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

    // Format the response to return the user data
    const formattedRequests = pendingRequests.map(request => {
        if (request.sender_id === user.id) {
            return { 
                id: request.reciever.id, 
                username: request.reciever.username, 
                image_url: request.reciever.image_url, 
                name: request.reciever.name,
                phone_number: request.reciever.phone_number,
                isSender: false  // Flag to indicate the request is pending on the other side
            };
        } else {
            return { 
                id: request.sender.id, 
                username: request.sender.username, 
                image_url: request.sender.image_url, 
                name: request.sender.name,
                phone_number: request.sender.phone_number,
                isSender: true  // Flag to indicate the request is pending from the current user
            };
        }
    });

    return NextResponse.json({
        success: true,
        data: formattedRequests
    }, { status: 200 });
};
