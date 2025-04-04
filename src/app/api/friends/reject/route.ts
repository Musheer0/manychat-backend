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
         const user = await GetUserByClerkId(userId);
         if(!user) return NextResponse.json({
            error: 'invalid id'
        },{
            status:401
        });

        await prisma.friend.delete({
            where:{
                id,
                AND:[
                    {reciever_id: user.id}
                ]
            },
        });
        return NextResponse.json({
            success: true,
            data:{
                request: {
                    id,
                    status: null
                }
            }
         })

}