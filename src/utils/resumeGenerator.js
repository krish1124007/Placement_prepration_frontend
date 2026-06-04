import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: parse skills string array into {languages, tools}
// Skills stored as plain strings. We detect categories by checking if a skill
// string contains ":" (e.g. "Languages: C, C++") or we split them simply.
// ─────────────────────────────────────────────────────────────────────────────
function parseSkills(skills = []) {
    let languages = '';
    let tools = '';

    // Check if any skill entry has category prefix (e.g. "Languages: C, C++")
    const langEntry  = skills.find(s => /^(programming|language|scripting)/i.test(s));
    const toolsEntry = skills.find(s => /^(tools|libraries|frameworks|tech)/i.test(s));

    if (langEntry) {
        languages = langEntry.includes(':') ? langEntry.split(':')[1].trim() : langEntry;
    }
    if (toolsEntry) {
        tools = toolsEntry.includes(':') ? toolsEntry.split(':')[1].trim() : toolsEntry;
    }

    // Fallback: if no categories detected, split skills into two halves
    if (!languages && !tools && skills.length > 0) {
        const half = Math.ceil(skills.length / 2);
        languages = skills.slice(0, half).join(', ');
        tools     = skills.slice(half).join(', ');
    }

    return { languages, tools };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: parse projects (array of strings or objects)
// Template expects: [{title, duration, description, github}]
// ─────────────────────────────────────────────────────────────────────────────
function parseProjects(projects = []) {
    return projects.map(p => {
        if (typeof p === 'string') {
            return {
                title:       p,
                duration:    '',
                description: '',
                github:      '',
            };
        }
        return {
            title:       p.title       || p.name        || '',
            duration:    p.duration    || p.period       || '',
            description: p.description || p.desc         || '',
            github:      p.github      || p.link         || '',
        };
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: parse experience (array of strings or objects)
// Template expects: [{role, company, duration, point1, point2, point3}]
// ─────────────────────────────────────────────────────────────────────────────
function parseExperience(experience = []) {
    return experience.map(e => {
        if (typeof e === 'string') {
            return { role: e, company: '', duration: '', point1: '', point2: '', point3: '' };
        }
        const points = e.points || e.description || [];
        const arr    = Array.isArray(points) ? points : [points];
        return {
            role:     e.role     || e.title        || '',
            company:  e.company  || e.organization || '',
            duration: e.duration || e.period       || '',
            point1:   arr[0] || '',
            point2:   arr[1] || '',
            point3:   arr[2] || '',
        };
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: parse education rows
// Template expects: [{exam, university, institute, year, score}]
// ─────────────────────────────────────────────────────────────────────────────
function parseEducation(education, user) {
    if (education && Array.isArray(education) && education.length > 0) {
        return education.map(e => ({
            exam:       e.exam       || e.examination || '',
            university: e.university || '',
            institute:  e.institute  || e.college     || '',
            year:       e.year       || '',
            score:      e.score      || e.cpi         || e.cgpa || '',
        }));
    }

    // Fallback: single row from flat user fields
    if (user.branch || user.passing_year) {
        return [{
            exam:       'Graduation',
            university: user.university  || '',
            institute:  user.college     || '',
            year:       user.passing_year|| '',
            score:      user.cpi         || user.cgpa || (user.sem ? `Sem ${user.sem}` : ''),
        }];
    }

    return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export const generateResumePDF = async (userData) => {
    // 1. Fetch the DOCX template from /public/resume.docx
    const response = await fetch('/resume.docx');
    if (!response.ok) {
        throw new Error(`Could not load resume template: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();

    // 2. Load into PizZip
    const zip = new PizZip(arrayBuffer);

    // 2b. Programmatically apply premium bolding formatting & make hobbies fully dynamic
    let docXml = zip.file('word/document.xml').asText();

    // Make student name bold and premium size (28)
    docXml = docXml.replace('<w:t>student_name</w:t>', '<w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t>student_name</w:t>');

    // Bold the projects title: • {{title}} ({{duration}})
    docXml = docXml.replace('<w:t>• {{title}} ({{duration}})</w:t>', '<w:t>• </w:t></w:r><w:r><w:rPr><w:b/></w:rPr><w:t>{{title}}</w:t></w:r><w:r><w:t> ({{duration}})</w:t>');

    // Bold the work experience role: {{role}} | {{company}} ({{duration}})
    docXml = docXml.replace('<w:t>{{role}} | {{company}} ({{duration}})</w:t>', '<w:rPr><w:b/></w:rPr><w:t>{{role}}</w:t></w:r><w:r><w:t> | {{company}} ({{duration}})</w:t>');

    // Bold the education degree: {{exam}} | {{university}} | {{institute}} | {{year}} | {{score}}
    docXml = docXml.replace('<w:t>{{exam}} | {{university}} | {{institute}} | {{year}} | {{score}}</w:t>', '<w:rPr><w:b/></w:rPr><w:t>{{exam}}</w:t></w:r><w:r><w:t> | {{university}} | {{institute}} | {{year}} | {{score}}</w:t>');

    // Convert the static hardcoded hobbies block to a fully dynamic loop
    const oldHobbiesXml = '<w:p w14:paraId="43F6F271" w14:textId="77777777" w:rsidR="00681153" w:rsidRDefault="00681153" w:rsidP="00681153"><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="1"/><w:numId w:val="1"/></w:numPr><w:tabs><w:tab w:val="left" w:pos="600"/><w:tab w:val="left" w:pos="9632"/></w:tabs><w:spacing w:before="31" w:line="218" w:lineRule="exact"/><w:ind w:left="1039" w:hanging="198"/><w:rPr><w:i/><w:sz w:val="20"/></w:rPr></w:pPr><w:r><w:rPr><w:i/><w:sz w:val="20"/></w:rPr><w:t>Coding</w:t></w:r></w:p><w:p w14:paraId="37A084A0" w14:textId="5E762BC3" w:rsidR="00681153" w:rsidRPr="00681153" w:rsidRDefault="00681153" w:rsidP="00681153"><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="1"/><w:numId w:val="1"/></w:numPr><w:tabs><w:tab w:val="left" w:pos="600"/><w:tab w:val="left" w:pos="9632"/></w:tabs><w:spacing w:before="31" w:line="218" w:lineRule="exact"/><w:ind w:left="1039" w:hanging="198"/><w:rPr><w:i/><w:sz w:val="20"/></w:rPr></w:pPr><w:r><w:rPr><w:i/><w:sz w:val="20"/></w:rPr><w:t>Playing Chess</w:t></w:r></w:p>';
    const newHobbiesXml = '<w:p w14:paraId="43F6F271" w14:textId="77777777" w:rsidR="0005340C" w:rsidRPr="0005340C" w:rsidRDefault="0005340C" w:rsidP="0079596A"><w:r w:rsidRPr="0005340C"><w:t>{{#hobbies}}</w:t></w:r></w:p><w:p w14:paraId="37A084A0" w14:textId="77777777" w:rsidR="0005340C" w:rsidRPr="0005340C" w:rsidRDefault="0005340C" w:rsidP="0079596A"><w:r w:rsidRPr="0005340C"><w:t>• {{name}}</w:t></w:r></w:p><w:p w14:paraId="37A084A1" w14:textId="774709B1" w:rsidR="00681153" w:rsidRDefault="0005340C" w:rsidP="0079596A"><w:pPr><w:rPr><w:i/><w:sz w:val="20"/></w:rPr></w:pPr><w:r w:rsidRPr="0079596A"><w:t>{{/hobbies}}</w:t></w:r></w:p>';
    docXml = docXml.replace(oldHobbiesXml, newHobbiesXml);

    zip.file('word/document.xml', docXml);

    // 3. Create Docxtemplater instance
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks:    true,
        delimiters: {
            start: '{{',
            end: '}}'
        }
    });

    // 4. Build the data object — mapping your DB fields → template variables
    const { languages, tools } = parseSkills(userData.skills || []);

    const educationData = parseEducation(userData.education || null, userData);
    const finalEducation = educationData.length > 0 ? educationData : [
        { exam: 'Bachelor of Technology (B.Tech)', university: 'State Technical University', institute: 'College of Engineering', year: '2022 - 2026', score: '9.2 CGPA' },
        { exam: 'Higher Secondary Certificate (HSC)', university: 'State Board of Education', institute: 'St. Jude Academy', year: '2020 - 2022', score: '95%' }
    ];

    const projectsData = parseProjects(userData.projects || []);
    const finalProjects = projectsData.length > 0 ? projectsData : [
        { title: 'AI-Powered Interview Prep Platform', duration: 'Jan 2026 - Mar 2026', description: 'Developed a full-stack platform featuring mock voice interviews, real-time code execution, and AI scoring powered by Gemini and Llama 3.', github: 'github.com/alexmorgan/interview-prep' },
        { title: 'Real-time Collaborative Code Editor', duration: 'Sep 2025 - Nov 2025', description: 'Built a shared coding environment supporting multi-user live editing, syntax highlighting, and integrated voice chat using WebRTC and WebSockets.', github: 'github.com/alexmorgan/collab-code' }
    ];

    const experienceData = parseExperience(userData.experience || []);
    const finalExperience = experienceData.length > 0 ? experienceData : [
        { role: 'Software Engineer Intern', company: 'Tech Innovation Labs', duration: 'May 2025 - Jul 2025', point1: 'Engineered responsive web applications using React.js and Redux, reducing bundle size by 24%.', point2: 'Optimized high-traffic RESTful backend APIs, increasing request handling efficiency by 18%.', point3: 'Collaborated in an agile team of 5, writing comprehensive Jest unit tests and automating CI/CD pipelines.' }
    ];

    const achievementsData = (userData.achievements || []).map(a => ({
        achievement: typeof a === 'string' ? a : a.text || String(a),
    }));
    const finalAchievements = achievementsData.length > 0 ? achievementsData : [
        { achievement: 'Winner of national-level Hackathon out of 150 competing teams (2025)' },
        { achievement: 'Secured 5-star coder rank on CodeChef and Top 5% in LeetCode monthly contests' },
        { achievement: 'Published a peer-reviewed research paper on Natural Language Processing at IEEE conference (2025)' }
    ];

    const interestsData = (userData.interests || []).map(i => ({
        name: typeof i === 'string' ? i : i.name || String(i),
    }));
    const finalInterests = interestsData.length > 0 ? interestsData : [
        { name: 'System Design' },
        { name: 'Cloud Computing' },
        { name: 'Artificial Intelligence' },
        { name: 'Open Source Contribution' }
    ];

    const hobbiesData = (userData.hobbies || []).map(h => ({
        name: typeof h === 'string' ? h : h.name || String(h),
    }));
    const finalHobbies = hobbiesData.length > 0 ? hobbiesData : [
        { name: 'Competitive Chess' },
        { name: 'Technical Blogging' },
        { name: 'Photography' }
    ];

    const templateData = {
        // ── Basic info ────────────────────────────────────────────────────
        student_name:    userData.name          || 'Alex Morgan',
        student_role:    userData.branch        || 'Software Engineering / Full Stack Developer',
        college:         userData.college       || userData.institution || 'State Technical University',
        email:           userData.email         || 'alex.morgan@email.com',
        contact_number:  userData.phone         || userData.mobile || '+1 (555) 019-2834',
        linkdin:         userData.linkedin      || 'linkedin.com/in/alexmorgan',
        github:          userData.github        || 'github.com/alexmorgan',
        degree:          userData.degree        || 'B.Tech',
        gender:          userData.gender        || 'Male',

        // ── Skills ────────────────────────────────────────────────────────
        languages:       languages              || 'JavaScript, TypeScript, Python, Java, C++, HTML5, CSS3',
        tools:           tools                  || 'React.js, Node.js, Express, MongoDB, Git, Docker, AWS',

        // ── Loop sections ─────────────────────────────────────────────────
        education:    finalEducation,
        projects:     finalProjects,
        experience:   finalExperience,
        achievements: finalAchievements,
        interests:    finalInterests,
        hobbies:      finalHobbies,
    };

    // 5. Render (replace all {{...}} placeholders)
    doc.render(templateData);

    // 6. Generate output blob
    const outputBlob = doc.getZip().generate({
        type:        'blob',
        mimeType:    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        compression: 'DEFLATE',
    });

    // 7. Trigger download
    const fileName = `${(userData.name || 'Resume').replace(/\s+/g, '_')}_Resume.docx`;
    saveAs(outputBlob, fileName);
};
