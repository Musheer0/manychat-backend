"use server"

import prisma from "./prisma";
import { GetUserByClerkId } from "./user"
import webpush from 'web-push'
webpush.setVapidDetails(
    'mailto:musheeran165@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )
   
export const SubscribePushNotification = async({
   sub,
   userId,
   ip
}:{
    sub:string,
    userId:string,
    ip:string
}) =>{
    if( sub && userId && ip){
     const user = await GetUserByClerkId(userId);
     console.log(user)
     if(user){
        try {
            const subscription =  await prisma.pushSubscriptions.create({
                data:{
                    subscription: sub,
                    ip,
                    user_id: user.id,
                }
            });
            return subscription;
        } catch  {
            return null
        }
     }else return null
    }
    return null
};
export const UnsubscribeNotification = async({
    userId,
    id
}:{
    userId:string, 
    id:string
})=>{
    const user = await GetUserByClerkId(userId);
    if(!user) throw Error("Invalid User id from unsubscribe");
    await prisma.pushSubscriptions.delete({
        where:{
            id,
            user_id: user.id
        }
    });
    return id
};
export const SendBrowserNotification = async({
    title,
    body,
    userId,
    url,

}:{
    title:string,
    body:string,
    userId:string,
    url?:string
})=>{
   const user = await GetUserByClerkId(userId);
   if(!user) throw Error("invalid user id");
   const subscriptions = await prisma.pushSubscriptions.findMany({
    where:{
        user_id: user.id
    }
   })
  
   if(subscriptions.length===0) throw Error("Error sending notification invalid id");
   const notifications = await subscriptions.map(async(subscription)=>{
    await webpush.sendNotification(
        JSON.parse(subscription.subscription) ,JSON.stringify({
            title,
            body,
            icon: '/icon.png',
            url: url || `${process.env.BASE}\notifications`
        })
       );
   })
   await Promise.all(notifications);
   return {
    success: true
   }
};