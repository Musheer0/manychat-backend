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
