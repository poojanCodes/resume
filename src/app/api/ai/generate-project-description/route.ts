import { GenerateProjectDescriptionBody } from "@/types/ai.types";
import { ApiResponse } from "@/types/api.types";
import { NextRequest, NextResponse } from 'next/server';
import { generateAiContent } from "@/lib/gemini";

export async function POST(req: NextRequest) {

    try {


        const body: GenerateProjectDescriptionBody = await req.json();

        const { experienceLevel, jobTitle, techStack } = body;

        if (!experienceLevel || !jobTitle) {
            return NextResponse.json<ApiResponse>({
                success: false,
                message: 'All fields are required'
            }, {
                status: 400
            });
        }

        const prompt = `
Generate a professional ATS-friendly resume project description.

Input:

* Job Title: ${jobTitle}
* Experience Level: ${experienceLevel}
* Tech Stack: ${techStack.join(", ")}

Rules:

1. Generate a realistic project description suitable for a resume.
2. Tailor the project complexity according to the experience level.
3. Naturally incorporate the provided technologies.
4. Highlight technical implementation, features, and impact.
5. Use strong action verbs such as Developed, Built, Designed, Implemented, Optimized, Integrated, or Engineered.
6. Keep the description between 60 and 100 words.
7. Write in a professional, ATS-friendly tone.
8. Do not include project names, headings, numbering, bullet points, markdown, or explanations.
9. Do not invent technologies outside the provided tech stack.
10. Generate exactly one paragraph.
11. Return only valid JSON.
12. The output must be directly parsable using JSON.parse().

Output Format:
{
"description": "..."
}
`;


        const result = await generateAiContent(prompt);

        if (!result) {
            throw new Error("No response received from Gemini");
        }

        const cleaned = result
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const parsed = JSON.parse(cleaned);

        return NextResponse.json({
            success: true,
            message: "Project description generated successfully",
            data: parsed
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