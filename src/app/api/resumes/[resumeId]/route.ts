import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/api.types";
import { connectToDb } from "@/lib/database";
import { getCurrentUser } from "@/lib/getCurrentUser";
import resumeModel from "@/models/resume.model";




export async function GET(req: NextRequest,

    { params }: { params: Promise<{ resumeId: string }> }) {

    try {


        await connectToDb();

        const user = await getCurrentUser();

        const { resumeId } = await params;

        const resume = await resumeModel.findOne({
            _id: resumeId,
            user_id: user.userId,
        });


        if (!resume) {
            return NextResponse.json<ApiResponse>({
                success: false,
                message: ' resume not found',
            }, {
                status: 404
            });
        }

        return NextResponse.json<ApiResponse>({
            success : true, 
            message: 'Resume fetched succesfully',
            data : resume
        })


    } catch (error) {
        console.log(error);
        return NextResponse.json<ApiResponse>({
            success: false,
            message: 'Something went wrong',
        }, {
            status: 500
        });
    }


}


export async function PATCH(req: NextRequest,

    { params }: { params: Promise<{ resumeId: string }> }) {

    try {


        await connectToDb();

        const user = await getCurrentUser();

        const body = await req.json();

        const { resumeId } = await params;

        const updatedResume = await resumeModel.findOneAndUpdate({
            _id : resumeId,
            user_id : user.userId
        } , 
        {
            $set:body,
        },
        {
            new:true,
            runValidators : true
        }
)

        

        if (!updatedResume) {
            return NextResponse.json<ApiResponse>({
                success: false,
                message: ' resume failed updated',
            }, {
                status: 400
            });
        }

        return NextResponse.json<ApiResponse>({
            success : true, 
            message: 'Resume fetched succesfully',
            data : updatedResume
        })

         

    } catch (error) {
        console.log(error);
        return NextResponse.json<ApiResponse>({
            success: false,
            message: 'Something went wrong',
        }, {
            status: 500
        });
    }


}

export async function DELETE(req: NextRequest,
    { params }: { params: Promise<{ resumeId: string }> }) {

    try {
        await connectToDb();
        const user = await getCurrentUser();
        const { resumeId } = await params;

        const deletedResume = await resumeModel.findOneAndDelete({
            _id: resumeId,
            user_id: user.userId
        });

        if (!deletedResume) {
            return NextResponse.json<ApiResponse>({
                success: false,
                message: 'Resume not found or unauthorized',
            }, {
                status: 404
            });
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            message: 'Resume deleted successfully',
        });

    } catch (error) {
        console.log(error);
        return NextResponse.json<ApiResponse>({
            success: false,
            message: 'Something went wrong',
        }, {
            status: 500
        });
    }
}

