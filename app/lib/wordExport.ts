export const exportToWord = (resumeData: any, filename: string = 'Resume.doc') => {
    if (!resumeData) return;

    const { 
        personalInfo, 
        professionalSummary, 
        skills, 
        softSkills, 
        experience, 
        education, 
        projects, 
        certifications 
    } = resumeData;

    // Use HTML tables for layout as MS Word parses them much better than CSS floats or flexbox
    let html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
        <meta charset='utf-8'>
        <title>Resume</title>
        <style>
            body { font-family: 'Calibri', 'Times New Roman', serif; font-size: 11pt; color: #000; line-height: 1.15; }
            h1 { font-size: 24pt; text-align: center; margin-bottom: 5pt; font-family: 'Arial', sans-serif; }
            h2 { font-size: 12pt; border-bottom: 1pt solid #000; margin-top: 12pt; margin-bottom: 6pt; text-transform: uppercase; font-family: 'Arial', sans-serif; }
            .contact-info { text-align: center; font-size: 10pt; margin-bottom: 12pt; }
            ul { margin-top: 2pt; margin-bottom: 8pt; padding-left: 20pt; }
            li { margin-bottom: 2pt; }
            p { margin: 2pt 0; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 0; vertical-align: top; }
        </style>
    </head>
    <body>
    `;

    // Name
    html += `<h1>${personalInfo?.name || 'Your Name'}</h1>`;
    
    // Contact Info
    const contacts = [
        personalInfo?.email,
        personalInfo?.phoneNumber,
        personalInfo?.location,
        personalInfo?.linkedin,
        personalInfo?.github
    ].filter(Boolean).join(' | ');
    html += `<div class="contact-info">${contacts}</div>`;

    // Summary
    if (professionalSummary) {
        html += `<h2>Summary</h2><p>${professionalSummary}</p>`;
    }

    // Experience
    if (experience && experience.length > 0) {
        html += `<h2>Experience</h2>`;
        experience.forEach((exp: any) => {
            html += `
            <table>
                <tr>
                    <td align="left"><b>${exp.jobTitle}</b>, ${exp.company} ${exp.location ? `(${exp.location})` : ''}</td>
                    <td align="right">${exp.startDate} – ${exp.endDate}</td>
                </tr>
            </table>
            `;
            if (exp.bullets && exp.bullets.length > 0) {
                html += `<ul>`;
                exp.bullets.forEach((b: string) => {
                    html += `<li>${b}</li>`;
                });
                html += `</ul>`;
            }
        });
    }

    // Projects
    if (projects && projects.length > 0) {
        html += `<h2>Projects</h2>`;
        projects.forEach((proj: any) => {
            html += `
            <table>
                <tr>
                    <td align="left"><b>${proj.name}</b> ${proj.role ? `– ${proj.role}` : ''}</td>
                    <td align="right">${proj.startDate} – ${proj.endDate}</td>
                </tr>
            </table>
            `;
            if (proj.bullets && proj.bullets.length > 0) {
                html += `<ul>`;
                proj.bullets.forEach((b: string) => {
                    html += `<li>${b}</li>`;
                });
                html += `</ul>`;
            }
        });
    }

    // Education
    if (education && education.length > 0) {
        html += `<h2>Education</h2>`;
        education.forEach((edu: any) => {
            html += `
            <table>
                <tr>
                    <td align="left"><b>${edu.institution}</b> ${edu.location ? `(${edu.location})` : ''}</td>
                    <td align="right">${edu.startDate} – ${edu.endDate}</td>
                </tr>
            </table>
            <p>${edu.degree}</p>
            ${edu.highlights ? `<p><i>${edu.highlights}</i></p>` : ''}
            `;
        });
    }

    // Skills
    if ((skills && skills.length > 0) || (softSkills && softSkills.length > 0)) {
        html += `<h2>Skills</h2>`;
        if (skills && skills.length > 0) {
            html += `<p><b>Hard Skills:</b> ${skills.join(', ')}</p>`;
        }
        if (softSkills && softSkills.length > 0) {
            html += `<p><b>Soft Skills:</b> ${softSkills.join(', ')}</p>`;
        }
    }

    // Certifications
    if (certifications && certifications.length > 0) {
        html += `<h2>Certifications</h2><ul>`;
        certifications.forEach((cert: string) => {
            html += `<li>${cert}</li>`;
        });
        html += `</ul>`;
    }

    html += `</body></html>`;

    // Create a Blob with the HTML content and the correct MIME type for MS Word
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};