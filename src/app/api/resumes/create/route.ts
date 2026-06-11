import { getCurrentUser } from "@/lib/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";
import { connectToDb } from "@/lib/database";
import resumeModel from "@/models/resume.model";
import { ApiResponse } from "@/types/api.types";


export async function POST(req:NextRequest){
    try {


        await connectToDb();

        const userId = await getCurrentUser();

        const newResume = await resumeModel.create({
            user_id : userId ,
            title : '',
            summary : '',
            personalInfo : {},
            workExperience : [],
            projects : [],
            education : [],
            certification : [],
            skills : []
        });

        return NextResponse.json<ApiResponse>({
            success : true , 
            message : 'Resume created successfully',
            data : newResume , 
        } , {status:201});

    } catch (error) {
        console.log('Error while creating resume');

        return NextResponse.json<ApiResponse>({
            success : false , 
            message : 'Something went wrong',
        })
    }
}