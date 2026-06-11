import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/api.types";

export async function POST() {
    try {
        let response = NextResponse.json<ApiResponse>({
            success: true,
            message: 'Logged out successfully'
        });

        response.cookies.set('token', '', {
            httpOnly: true,
            sameSite: 'lax',
            expires: new Date(0) // Expire immediately
        });

        return response;
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json<ApiResponse>({
            success: false,
            message: 'Something went wrong',
        }, {
            status: 500
        });
    }
}
