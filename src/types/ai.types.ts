export interface GenerateSummaryBody{
    experienceLevel : string ; 
    skills : string[];
    jobTitle : string ; 
}

export interface GenerateSkillBody{
    experienceLevel : string ; 
    jobTitle : string ; 
}

export interface GenerateProjectDescriptionBody{
    experienceLevel : string ; 
    jobTitle : string ; 
    techStack : string[]
}

export interface GenerateExperienceDesciptionBody{
    experienceLevel : string ; 
    jobRole : string ; 
    yearsOfExperience : number;
    techStack : string[];
}

export interface ImproveContentBody{
    content : string ; 
}

export interface atsScoreBody{
    resumeText : string ; 
}