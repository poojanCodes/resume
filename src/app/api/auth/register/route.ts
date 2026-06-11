import { connectToDb } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";
import { RegisterBody } from "@/types/user.types";
import { ApiResponse } from "@/types/api.types";
import userModel from "@/models/user.model";
import { generateToken } from "@/lib/jwt";


export async function POST(req: NextRequest) {

    try {

        await connectToDb();

        const body: RegisterBody = await req.json();

        const { email, username, password, mobile } = body;

        if (!email || !username || !password) {
            return NextResponse.json<ApiResponse>({
                success: false,
                message: 'All fields required'
            }, {
                status: 400
            })
        }

        const isUserExisted = await userModel.findOne({
            $or: [{ email }, { username }]
        });


        if (isUserExisted) {
            return NextResponse.json<ApiResponse>({
                success: false,
                message: 'User already existed'
            }, {
                status: 409
            })
        }


        const newUser = await userModel.create({
            username,
            email,
            password,
            mobile,
        });


        const token = generateToken({ userId: newUser._id.toString() });


        let response = NextResponse.json<ApiResponse>({
            success: true,
            message: 'User registered',
            data: {
                user: {
                    _id: newUser._id,
                    name: newUser.username,
                    email: newUser.email
                }
            }
        }, { status: 201 });

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