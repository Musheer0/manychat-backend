import { SubscribePushNotification, UnsubscribeNotification } from "@/utils/push-notification-subscription";
import { GetUserByClerkId } from "@/utils/user";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async(req:NextRequest)=>{
    const {userId} = await auth();
    const ip =req.headers.get('x-forwaded-for')||'127.0.0.1'
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
    const body =await  req.json();
    //body
    if(!body.sub)return NextResponse.json({
        error: 'Missing data'
    },{
        status:301
    });
    //subscribe notification
   try {
    const notification_subscriptions = await UnsubscribeNotification({
        userId,
        id: body.id});
        return NextResponse.json({
            sucess: true,
            data:{
                id: notification_subscriptions
            }
           });
   } catch (error) {
    return NextResponse.json({
        sucess: false,
       },{
        status: 500
       });
   }
 
}