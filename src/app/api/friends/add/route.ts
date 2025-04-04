import prisma from "@/utils/prisma";
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
         const db_user = await GetUserByClerkId(userId);
         if(!db_user) return NextResponse.json({
            error: 'invalid id'
        },{
            status:401
        });
         const db_friend = await GetUserById(id);
         if(!db_friend) return NextResponse.json({
            error: 'invalid id'
        },{
            status:401
        });
        const friend_request = await prisma.friend.create({
            data:{
                sender_id: db_user.id,
                reciever_id: db_friend.id,
            }
        });
        if(friend_request){
             return NextResponse.json({
                success: true,
                data:{
                    sender:{
                        id: db_user.id,
                        image_url: db_user.image_url,
                        username: db_user.username,
                        phone_number: db_user.phone_number,
                        name: db_user.name
                    },
                    receiver:{
                        id: db_friend.id,
                        image_url: db_friend.image_url,
                        username: db_friend.username,
                        phone_number: db_friend.phone_number,
                        name: db_friend.name
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