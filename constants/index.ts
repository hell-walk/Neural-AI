export interface FeedbackTip {
    type: "good" | "improve";
    tip: string;
    explanation?: string;
}

export interface FeedbackSection {
    score: number;
    tips: FeedbackTip[];
}

export interface Feedback {
    overallScore: number;
    ATS: FeedbackSection;
    toneAndStyle: FeedbackSection;
    content: FeedbackSection;
    structure: FeedbackSection;
    skills: FeedbackSection;
}

export interface Resume {
    id: string;
    companyName: string;
    jobTitle: string;
    imagePath: string;
    resumePath: string;
    feedback: Feedback;
}

export const resumes: Resume[] = [
    {
        id: "1",
        companyName: "Google",
        jobTitle: "Frontend Developer",
        imagePath: "public/public/images/resume_01.png",
        resumePath: "/resumes/resume-1.pdf",
        feedback: {
            overallScore: 85,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "2",
        companyName: "Microsoft",
        jobTitle: "Cloud Engineer",
        imagePath: "public/public/images/resume_02.png",
        resumePath: "/resumes/resume-2.pdf",
        feedback: {
            overallScore: 55,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "3",
        companyName: "Apple",
        jobTitle: "iOS Developer",
        imagePath: "public/public/images/resume_03.png",
        resumePath: "/resumes/resume-3.pdf",
        feedback: {
            overallScore: 75,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
];

export const AIResponseFormat = `
      interface Feedback {
      overallScore: number; //max 100
      ATS: {
        score: number; //rate based on ATS suitability
        tips: {
          type: "good" | "improve";
          tip: string; //give 3-4 tips
        }[];
      };
      toneAndStyle: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      content: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      structure: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      skills: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
    }`;

export const prepareInstructions = ({
                                        jobTitle,
                                        jobDescription,
                                    }: {
    jobTitle: string;
    jobDescription: string;
}) =>
    `You are an expert in ATS (Applicant Tracking System) and resume analysis.
  Please analyze and rate this resume and suggest how to improve it.
  The rating can be low if the resume is bad.
  Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
  If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their resume.
  If available, use the job description for the job user is applying to to give more detailed feedback.
  If provided, take the job description into consideration.
  The job title is: ${jobTitle}
  The job description is: ${jobDescription}
  Provide the feedback using the following format: ${AIResponseFormat}
  Return the analysis as a JSON object, without any other text and without the backticks.
  Do not include any other text or comments.`;

// ── AI Response Format ────────────────────────────────────────────────────────

export const ResumeAIResponseFormat = `
  interface GeneratedResume {
    personalInfo: {
      name: string;
      email: string;
      phoneNumber: string;
      location: string;
      linkedin?: string;
      github?: string;
      headline: string; // e.g. "Digital Marketing | SEO | SEM | Content Marketing"
    };
    professionalSummary: string; // 2-3 lines max, ATS optimized
    skills: string[]; // flat list, max 8 — used as bullet points in template
    softSkills: string[]; // flat list, max 6
    skillLevels: number[]; // 0-100 per skill, same order as skills[] — used for progress bars in template 2
    experience: {
      jobTitle: string;
      company: string;
      location: string;
      startDate: string;
      endDate: string; // "Present" if current
      bullets: string[]; // 2-3 bullets max, each under 120 characters — rendered as SVG text lines
    }[];
    projects: {
      name: string;
      role: string;
      startDate: string;
      endDate: string;
      bullets: string[]; // 2-3 bullets max, each under 120 characters
    }[];
    education: {
      degree: string;
      institution: string;
      location: string;
      startDate: string;
      endDate: string;
      highlights?: string; // single short line e.g. "GPA: 3.8, Dean's List"
    }[];
    certifications: string[]; // flat list e.g. "AWS Certified Solutions Architect — Amazon, 2023"
    languages: {
      name: string;
      proficiency: string; // "Native" | "Fluent" | "Intermediate" | "Basic"
      level: number; // 0-5 — used for dot rating in template 2
    }[];
    extracurricularActivities: {
      title: string;
      organization: string;
      description: string; // single line, under 100 characters
    }[];
  }`;

// ── Prompt ────────────────────────────────────────────────────────────────────

export const prepareResumeGenerationInstructions = ({
                                                        name,
                                                        email,
                                                        phoneNumber,
                                                        location,
                                                        linkedin,
                                                        github,
                                                        hasExperience,
                                                        skills,
                                                        softSkills,
                                                        experience,
                                                        projects,
                                                        education,
                                                        certifications,
                                                        extracurricularActivities,
                                                        description,
                                                        targetJobTitle,
                                                        targetJobDescription,
                                                        selectedTemplate,
                                                    }: {
    name: string;
    email: string;
    phoneNumber: string;
    location?: string;
    linkedin?: string;
    github?: string;
    hasExperience?: boolean | null;
    skills: string[];
    softSkills?: string[];
    experience: string[];
    projects: string[];
    education: string[];
    certifications: string[];
    extracurricularActivities: string[];
    description: string;
    targetJobTitle?: string;
    targetJobDescription?: string;
    selectedTemplate?: "template1" | "template2" | "template3";
}) =>
    `You are an expert resume writer with deep knowledge of ATS optimization.
  Generate a professional resume based on the user information below.
  The output will be directly rendered into an SVG resume template, so follow the constraints carefully.

  USER INFORMATION:
  - Full Name: ${name}
  - Email: ${email}
  - Phone Number: ${phoneNumber}
  - Location: ${location || "Not provided"}
  - LinkedIn: ${linkedin || "Not provided"}
  - GitHub: ${github || "Not provided"}
  - About / Description: ${description}
  - Hard Skills: ${skills.join(", ")}
  - Soft Skills: ${softSkills ? softSkills.join(", ") : "Not provided"}
  - User claims to have work experience: ${hasExperience ? "Yes" : "No (Fresher)"}
  - Work Experience Details: ${experience.join(" | ")}
  - Projects: ${projects.join(" | ")}
  - Education: ${education.join(" | ")}
  - Certifications: ${certifications.join(", ")}
  - Extracurricular Activities: ${extracurricularActivities.join(", ")}

  ${targetJobTitle ? `TARGET JOB TITLE: ${targetJobTitle}` : ""}
  ${targetJobDescription ? `TARGET JOB DESCRIPTION: ${targetJobDescription}` : ""}
  ${selectedTemplate ? `SELECTED TEMPLATE: ${selectedTemplate}` : ""}

  TEMPLATE RENDERING CONSTRAINTS — follow these strictly:
  - professionalSummary: maximum 3 lines of text, each line under 120 characters.
  - skills[]: maximum 8 items. Each skill name under 30 characters.
  - softSkills[]: maximum 6 items.
  - skillLevels[]: one number (0–100) per skill, same order as skills[]. Reflects real proficiency.
  - experience[].bullets: maximum 3 bullets per job. Each bullet under 120 characters. Start with an action verb. If user is a fresher or has no experience, return empty array.
  - projects[].bullets: maximum 3 bullets per project. Each bullet under 120 characters.
  - certifications[]: flat strings, format "Certification Name — Issuer, Year". Max 4 items.
  - languages[].level: integer 0–5. 5 = native, 4 = fluent, 3 = intermediate, 2–1 = basic.
  - All date fields: use "MMM YYYY" format e.g. "Jan 2021". Use "Present" for current roles.
  - Do not fabricate any information not provided by the user.
  - If a section has no data, return an empty array [] for it.

  ${
        selectedTemplate === "template1"
            ? `TEMPLATE 1 NOTES (Classic Dark Header):
         Single column layout. Sections order: summary → experience → projects → education → skills → certifications.
         Keep skills as a flat string[] — they render as 2-column bullet list.`
            : selectedTemplate === "template2"
                ? `TEMPLATE 2 NOTES (Two-Column Dark Sidebar):
         Sidebar renders: skills with progress bars (use skillLevels[]), languages with dot rating (use level 0-5).
         Right column renders: summary → experience timeline → projects → education.
         Skills max 8, languages max 4.`
                : selectedTemplate === "template3"
                    ? `TEMPLATE 3 NOTES (Minimal Clean):
         Left column: experience → projects → education.
         Right sidebar: contact info, skills (2-column bullet grid), languages, certifications.
         Keep all bullet text tight — SVG right column is narrow (264px).`
                    : ""
    }

  Provide the resume data using the following format: ${ResumeAIResponseFormat}
  Return the result as a JSON object only, without any other text and without backticks.
  Do not include any other text or comments.`;