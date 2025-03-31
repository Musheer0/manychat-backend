"use server"
import prisma from "./prisma"

export const GetUserById = async(id:string)=>{
    const user =await prisma.user.findFirst({
        where:{
            id
        }
    });
    return user
}
export const GetUserByClerkId = async(id:string)=>{
    const user =await prisma.user.findFirst({
        where:{
            clerk_id:id
        }
    });
    return user
}
export const GetUserByPhoneNumber = async(number:string)=>{
    const user =await prisma.user.findFirst({
        where:{
            phone_number: number
        }
    });
    return user
}
export const SendFriendRequest = async({sender, reciever}:{sender:string, reciever:string})=>{
    if(sender && reciever){
       const request = await prisma.friend.create({
        data:{
            sender_id:sender,
            reciever_id:reciever
        }
       });
       return request
    }
    return null;
}
export const GetFriendRequestById=async(id:string)=>{
    const request = await prisma.friend.findFirst({
        where:{
            id
        }
    });
    return request
}