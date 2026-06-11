import { connectToDb } from "@/lib/database";
import { LoginBody } from "@/types/user.types";
import { NextRequest , NextResponse } from "next/server";
import { ApiResponse } from "@/types/api.types";
import userModel from "@/models/user.model";
import { generateToken } from "@/lib/jwt";

export async function POST(req:NextRequest) {
    try {

        await connectToDb();

        const body: LoginBody = await req.json();

        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json<ApiResponse>({
                success: false,
                message: 'All fields required'
            }, {
                status: 400
            })
        }

        const isUserExisted = await userModel.findOne({email});


        if (!isUserExisted) {
            return NextResponse.json<ApiResponse>({
                success: false,
                message: 'User does not exists'
            }, {
                status: 409
            })
        }

        const isPasswordMatched = isUserExisted.comparePassword(password);

        if(!isPasswordMatched) {
            return NextResponse.json<ApiResponse>({
                success: false,
                message: 'Password is invalid' ,
            }, {
                status: 401
            })
        }


        const token = generateToken({ userId: isUserExisted._id.toString() });


        let response = NextResponse.json<ApiResponse>({
            success: true,
            message: 'User logged in',
            data: {
                user: {
                    _id: isUserExisted._id,
                    name: isUserExisted.username,
                    email: isUserExisted.email
                }
            }
        }, { status: 200 });

        response.cookies.set('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000 //1Hours
        });

        return response ; 


    } catch (error) {
        console.log('Error while registering', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            message: 'Something went wrong',
        }, {
            status: 500
        })
    }
}