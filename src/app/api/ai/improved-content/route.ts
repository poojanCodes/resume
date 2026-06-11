import { ImproveContentBody } from "@/types/ai.types";
import { ApiResponse } from "@/types/api.types";
import { NextRequest, NextResponse } from 'next/server';
import { generateAiContent } from "@/lib/gemini";

export async function POST(req: NextRequest) {

    try {


        const body: ImproveContentBody = await req.json();

        const { content} = body;

        if (!content) {
            return NextResponse.json<ApiResponse>({
                success: false,
                message: 'All fields are required'
            }, {
                status: 400
            });
        }
const prompt = `
Improve the following resume content.

Content:
${content}

Rules:

1. Rewrite and enhance the content while preserving its original meaning.
2. Improve grammar, clarity, readability, and professionalism.
3. Make the content ATS-friendly by using strong industry-relevant keywords where appropriate.
4. Use action-oriented and impactful language.
5. Maintain a professional resume-writing tone.
6. Do not add false information, technologies, achievements, certifications, or experience.
7. Keep the improved content approximately the same length as the original.
8. Remove repetitive or weak wording.
9. Ensure the content sounds natural and human-written.
10. Do not include explanations, suggestions, notes, headings, or markdown.
11. Return only valid JSON.
12. Do not wrap the response in code blocks.
13. The response must start with { and end with }.
14. The output must be directly parsable using JSON.parse().

Output Format:
{
"improvedContent": "Improved version of the provided content"
}
`;


        const result = await generateAiContent(prompt);

        const improvedContent = result ; 

         return NextResponse.json<ApiResponse>({
            success: true,
            message: 'Content improved for this :',
            data : {
                improvedContent
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