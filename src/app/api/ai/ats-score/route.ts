import { atsScoreBody } from "@/types/ai.types";
import { ApiResponse } from "@/types/api.types";
import { NextRequest, NextResponse } from 'next/server';
import { generateAiContent } from "@/lib/gemini";

export async function POST(req: NextRequest) {

    try {


        const body: atsScoreBody = await req.json();

        const { resumeText } = body;

        if (!resumeText) {
            return NextResponse.json<ApiResponse>({
                success: false,
                message: 'All fields are required'
            }, {
                status: 400
            });
        }
        const prompt = `
Analyze the following resume and provide an ATS (Applicant Tracking System) evaluation.

Resume Text:
${resumeText}

Rules:

1. Evaluate the resume for ATS compatibility.
2. Score the resume on a scale of 0 to 100.
3. Consider factors such as:

   * Professional Summary
   * Skills
   * Work Experience
   * Education
   * Keywords
   * Formatting Readability
   * Overall ATS Optimization
4. Provide 3 to 5 actionable improvement suggestions.
5. Be objective and realistic.
6. Do not include markdown, explanations, or code blocks.
7. Return only valid JSON.
8. The response must start with { and end with }.
9. The output must be directly parsable using JSON.parse().

Output Format:
{
"atsScore": 85,
"strengths": [
"Strong technical skills section",
"Relevant work experience",
"Clear professional summary"
],
"improvements": [
"Add more job-specific keywords",
"Quantify achievements with metrics",
"Improve summary with stronger impact statements"
]
}
`;


        const result = await generateAiContent(prompt);

        if (!result) {
            throw new Error("No response received from Gemini");
        }

        const cleaned = result
            .replace(/```json\s*/g, "")
            .replace(/```\s*/g, "")
            .trim();

        const scoreData = JSON.parse(cleaned);

        return NextResponse.json<ApiResponse>({
            success: true,
            message: 'Content improved for this :',
            data: {
                scoreData
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