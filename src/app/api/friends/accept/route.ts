import prisma from "@/utils/prisma";
import { SendBrowserNotification } from "@/utils/push-notification-subscription";
import { GetUserByClerkId, GetUserById } from "@/utils/user";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async(req:NextRequest)=>{
     const {userId} = await auth();
      //Todo Verify Request from front end
         const allow_api_request = true;
         if(!allow_api_request) return NextResponse.json({
             error: 'Un-autharized'
         },{
             status:401
         });
         // clerk authentication
         if(!userId) return NextResponse.json({
             error: 'Un-autharized'
         },{
             status:401
         });
         const id = req.nextUrl.searchParams.get("id")|| '';
         const user = await GetUserByClerkId(userId);
         if(!user) return NextResponse.json({
            error: 'invalid id'
        },{
            status:401
        });
        let friend_request = await prisma.friend.findFirst({
            where:{
                id,
                AND:[
                    {reciever_id: user.id}
                ]
            }
        })
        if(!friend_request) return NextResponse.json({
            error: 'invalid id'
        },{
            status:401
        });
        friend_request = await prisma.friend.update({
            where:{
                id,
                AND:[
                    {reciever_id: user.id}
                ]
            },
            data:{
                isAccepted:new Date()
            }
        });
         const sender = await GetUserById(friend_request.sender_id);
         if(!sender) return NextResponse.json({
            error: 'invalid id'
        },{
            status:401
        });
        if(friend_request){
            const chat = prisma.chat.create({
                data:{
                   friendId: friend_request.id,
                   users: {
                    connect:[
                        {
                            id: user.id
                        },
                        {
                            id: sender.id
                        }
                    ]
                   }
                }
            });
           try {
            await SendBrowserNotification({
                title: `${user.name} accepted your friend request`,
                body: `say hi to ${user.name} now!`,
                userId: user.id,
                url: `${process.env.BASE}/chat/${(await chat).id}`
            })
            
           } catch {
            return NextResponse.json({
                success: true,
                data:{
                    sender:{
                        id: sender.id,
                        image_url: sender.image_url,
                        username: sender.username,
                        phone_number: sender.phone_number,
                        name: sender.name
                    },
                    receiver:{
                        id: user.id,
                        image_url: user.image_url,
                        username: user.username,
                        phone_number: user.phone_number,
                        name: user.name
                    },
                    request: {
                        id: friend_request.id,
                        status: friend_request.isAccepted
                    },
                    error: 'Error sending sender a notification'
                }
             })
           }
             return NextResponse.json({
                success: true,
                data:{
                    sender:{
                        id: sender.id,
                        image_url: sender.image_url,
                        username: sender.username,
                        phone_number: sender.phone_number,
                        name: sender.name
                    },
                    receiver:{
                        id: user.id,
                        image_url: user.image_url,
                        username: user.username,
                        phone_number: user.phone_number,
                        name: user.name
                    },
                    request: {
                        id: friend_request.id,
                        status: friend_request.isAccepted
                    }
                }
             })
        }
        return NextResponse.json({
            error: 'invalid data'
        },{
            status:401
        });

}