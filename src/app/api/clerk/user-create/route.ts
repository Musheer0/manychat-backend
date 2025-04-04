import prisma from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export const POST = async(req:NextRequest)=>{
    const body = await req.json()
    const origin = req.referrer
    console.log(origin)
    const data =  body.data;
    try {
        const user = {
            id: data.id,
            imagr_url: data.image_url,
            username: data.username,
            first_name: data.first_name,
            last_name: data.last_name,
            //@ts-ignore
            phone_number : Array.from(data.phone_numbers).filter((number:any)=>number.id===data.primary_phone_number_id)[0]?.phone_number  || null
        };
        //todo add header check from clerk 
        const new_user = await prisma.user.create({
            data:{
                clerk_id: user.id,
                name: `${user.first_name}+${user.last_name}`,
                image_url: user.imagr_url,
                phone_number: user.phone_number,
                username: user.username
            }
        });
        console.log(new_user)
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            error: 'error'
        })
    }
    return NextResponse.json({
        success:true
    })
}