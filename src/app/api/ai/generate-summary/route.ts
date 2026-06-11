import { GenerateSummaryBody } from "@/types/ai.types";
import { ApiResponse } from "@/types/api.types";
import { NextRequest, NextResponse } from 'next/server';
import { generateAiContent } from "@/lib/gemini";

export async function POST(req: NextRequest) {

    try {


        const body: GenerateSummaryBody = await req.json();

        const { experienceLevel, skills, jobTitle } = body;

        if (!experienceLevel || !skills || !jobTitle) {
            return NextResponse.json<ApiResponse>({
                success: false,
                message: 'All fields are required'
            }, {
                status: 400
            });
        }

        const prompt = `
Generate a professional ATS-friendly resume summary based on the provided information.

Input:
- Job Title: ${jobTitle}
- Skills: ${skills}
- Experience Level: ${experienceLevel}

Rules:
1. Return ONLY the resume summary text.
2. Do not include headings, labels, bullet points, markdown, quotes, or explanations.
3. Write in a professional, confident, and recruiter-friendly tone.
4. Optimize for ATS by naturally incorporating the provided job title and relevant skills.
5. Tailor the summary specifically to the provided job title.
6. Highlight key strengths, technical expertise, and professional value.
7. Do not invent skills, certifications, achievements, or experience not provided in the input.
8. Keep the summary between 50 and 80 words.
9. Generate exactly one paragraph with no line breaks.
10. Use strong action-oriented language and industry-relevant keywords.
11. Avoid generic phrases such as "hardworking individual," "team player," "seeking opportunities," or "passionate professional."
12. Ensure the summary sounds natural, concise, and impactful.
13. The output must be ready to paste directly into a resume.

Output:
Return only the ATS-optimized resume summary.
`;

        const result = await generateAiContent(prompt);

        const summary = result ; 

         return NextResponse.json<ApiResponse>({
            success: true,
            message: 'Summary Generated for this :',
            data : {
                summary
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