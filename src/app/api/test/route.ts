import { SendBrowserNotification } from "@/utils/push-notification-subscription";
import { NextRequest, NextResponse } from "next/server";

export const POST = async(req:NextRequest)=>{
    const body = await req.json();
    console.log(body)
    return NextResponse.json({
        body
    })
}
export const GET = async(req:NextRequest)=>{
   try {
    const userId = req.nextUrl.searchParams.get('id');
    await SendBrowserNotification({
        title: 'Test Notification',
        body: 'thank you for subscribing',
        userId: userId!,
        
    })
    return NextResponse.json("sent notification")

   } catch (error) {
    return NextResponse.json(error)

   }
    return NextResponse.json("This is testing endpoint")

}