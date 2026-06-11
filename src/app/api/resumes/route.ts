import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/api.types";
import { connectToDb } from "@/lib/database";
import { getCurrentUser } from "@/lib/getCurrentUser";
import resumeModel from "@/models/resume.model";

export async function GET(req: NextRequest) {
    try {
        await connectToDb();

        const user = await getCurrentUser();

        const resumes = await resumeModel.find({
            user_id: user.userId,
        }).sort({ updatedAt: -1 });

        return NextResponse.json<ApiResponse>({
            success: true,
            message: 'Resumes fetched successfully',
            data: resumes
        });

    } catch (error) {
        console.log("Error fetching user resumes:", error);
        return NextResponse.json<ApiResponse>({
            success: false,
            message: 'Something went wrong',
        }, {
            status: 500
        });
    }
}
