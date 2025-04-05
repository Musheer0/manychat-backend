import prisma from "@/utils/prisma";
import { GetUserByClerkId } from "@/utils/user";
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
        const friend_request = await prisma.friend.update({
            where:{
                id,
                AND:[
                    {reciever_id: user.id}
                ]
            },
            data:{
                isBlocked: new Date(),
                isAccepted: null
            }
        })
        if(!friend_request) return NextResponse.json({
            error: 'invalid id'
        },{
            status:401
        });
        
        if(friend_request){
             return NextResponse.json({
                success: true,
                data:{
                    request: {
                        id: friend_request.id,
                        status: friend_request.isAccepted,
                        blocked: friend_request.isBlocked
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