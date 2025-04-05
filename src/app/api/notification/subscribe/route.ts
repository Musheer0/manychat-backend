import { SendBrowserNotification, SubscribePushNotification } from "@/utils/push-notification-subscription";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async(req:NextRequest)=>{
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
        return NextResponse.json(
            { error: "Missing Authorization Header" },
            { status: 401 }
        );
    }

    const {userId} = await auth();
    console.log(userId)
    const ip =req.headers.get('x-forwaded-for')||'127.0.0.1'
    //Todo Verify Request from front end
    const allow_api_request = true;
    if(!allow_api_request) return NextResponse.json({
        error: 'not allowed'
    },{
        status:401
    });
    // clerk authentication
    if(!userId) return NextResponse.json({
        error: 'Un-autharized clerk'
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
    const notification_subscriptions = await SubscribePushNotification({
        sub: body.sub,
        userId,
        ip
       });
       await SendBrowserNotification({
        title: 'Your subscribed to our notification',
        body: 'your recive updates from now on',
        userId
       })
       return NextResponse.json({
        success: true,
        data:{
            id: notification_subscriptions?.id,
        }
       });
  } catch (error){
    console.log(error)
    return NextResponse.json({
        error: 'Internal server error',
        cause: error
       }, {status: 500});
  }
}   
export async function OPTIONS() {
    const response = new NextResponse(null, { status: 200 });
  
    response.headers.set("Access-Control-Allow-Origin", process.env.WEBSITE_URL!); // Set allowed origin
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Allow-Credentials", "true");
  
    return response;
  }
  