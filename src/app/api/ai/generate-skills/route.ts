import { GenerateSkillBody } from "@/types/ai.types";
import { ApiResponse } from "@/types/api.types";
import { NextRequest, NextResponse } from 'next/server';
import { generateAiContent } from "@/lib/gemini";

export async function POST(req: NextRequest) {

    try {


        const body: GenerateSkillBody = await req.json();

        const { experienceLevel, jobTitle } = body;

        if (!experienceLevel|| !jobTitle) {
            return NextResponse.json<ApiResponse>({
                success: false,
                message: 'All fields are required'
            }, {
                status: 400
            });
        }

const prompt = `
Generate relevant resume skills for the provided job title and experience level.

Input:
- Job Title: ${jobTitle}
- Experience Level: ${experienceLevel}

Rules:
1. Generate 10-15 highly relevant skills for the specified job title.
2. Include a balanced mix of technical skills, tools, frameworks, and professional skills when applicable.
3. Ensure all skills are commonly used in the industry and ATS-friendly.
4. Tailor skills according to the experience level.
5. Do not generate explanations, descriptions, or categories.
6. Do not include numbering, bullet points, markdown, or additional text.
7. Avoid duplicate skills.
8. Return only valid JSON.
9. The output must be directly parsable using JSON.parse().

Output Format:
{
  "skills": [
    "Skill 1",
    "Skill 2",
    "Skill 3"
  ]
}
`;

        const result = await generateAiContent(prompt);

        let skills = result ; 

        if(typeof skills === 'string'){
            try {
                
                skills = JSON.parse(skills)

            } catch (error) {
                console.log(error)
            }
        }


         return NextResponse.json<ApiResponse>({
            success: true,
            message: 'Skills Generated for this :',
            data : {
                skills
            }
        }, {
            status: 200
        });

    } catch (error) {
        return NextResponse.json<ApiResponse>({
            success: false,
            message: 'Something went wrong',
        }, {
            status: 500
        });
    }


}