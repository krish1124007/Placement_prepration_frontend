import jsPDF from 'jspdf';

export const generateResumePDF = async (userData) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // Helper function to add a new page if needed
    const checkPageBreak = (requiredHeight) => {
        if (yPosition + requiredHeight > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            yPosition = margin;
            return true;
        }
        return false;
    };

    // Helper function to add text with word wrap
    const addText = (text, x, y, maxWidth, fontSize = 11, fontStyle = 'normal') => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return lines.length * (fontSize * 0.4);
    };

    // Header Section
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    const userName = userData.name || 'Your Name';
    doc.text(userName, margin, 25);
    
    // Contact Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const contactInfo = [];
    if (userData.email) contactInfo.push(userData.email);
    if (userData.github) {
        const githubUrl = userData.github.startsWith('http') ? userData.github : `https://github.com/${userData.github}`;
        contactInfo.push(`GitHub: ${githubUrl}`);
    }
    if (userData.linkedin) {
        const linkedinUrl = userData.linkedin.startsWith('http') ? userData.linkedin : `https://linkedin.com/in/${userData.linkedin}`;
        contactInfo.push(`LinkedIn: ${linkedinUrl}`);
    }
    if (userData.leetcode) {
        const leetcodeUrl = userData.leetcode.startsWith('http') ? userData.leetcode : `https://leetcode.com/${userData.leetcode}`;
        contactInfo.push(`LeetCode: ${leetcodeUrl}`);
    }
    
    if (contactInfo.length > 0) {
        const contactText = contactInfo.join(' | ');
        // Split contact info if too long
        const contactLines = doc.splitTextToSize(contactText, pageWidth - 2 * margin);
        doc.text(contactLines, margin, 35);
    }
    
    yPosition = 60;
    doc.setTextColor(0, 0, 0);

    // About Section
    if (userData.about) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('ABOUT', margin, yPosition);
        yPosition += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const aboutHeight = addText(userData.about, margin, yPosition, pageWidth - 2 * margin, 10);
        yPosition += aboutHeight + 10;
    }

    // Education Section
    if (userData.branch || userData.passing_year || userData.sem) {
        checkPageBreak(20);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('EDUCATION', margin, yPosition);
        yPosition += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const educationInfo = [];
        if (userData.branch) educationInfo.push(userData.branch);
        if (userData.sem) educationInfo.push(`Semester ${userData.sem}`);
        if (userData.passing_year) educationInfo.push(`Graduating ${userData.passing_year}`);
        
        doc.text(educationInfo.join(' | '), margin, yPosition);
        yPosition += 10;
    }

    // Skills Section
    if (userData.skills && userData.skills.length > 0) {
        checkPageBreak(20);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('SKILLS', margin, yPosition);
        yPosition += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(userData.skills.join(' • '), margin, yPosition);
        yPosition += 10;
    }

    // Projects Section
    if (userData.projects && userData.projects.length > 0) {
        checkPageBreak(30);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PROJECTS', margin, yPosition);
        yPosition += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        userData.projects.forEach((project, index) => {
            checkPageBreak(8);
            doc.text(`• ${project}`, margin + 5, yPosition);
            yPosition += 7;
        });
        yPosition += 5;
    }

    // GitHub Repositories Section
    if (userData.githubRepos && Array.isArray(userData.githubRepos) && userData.githubRepos.length > 0) {
        checkPageBreak(30);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('GITHUB REPOSITORIES', margin, yPosition);
        yPosition += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        userData.githubRepos.slice(0, 5).forEach((repo) => {
            if (!repo) return;
            checkPageBreak(15);
            doc.setFont('helvetica', 'bold');
            const repoName = repo.name || 'Repository';
            doc.text(repoName, margin + 5, yPosition);
            yPosition += 6;
            
            if (repo.description) {
                doc.setFont('helvetica', 'normal');
                const descHeight = addText(repo.description, margin + 10, yPosition, pageWidth - 2 * margin - 10, 9);
                yPosition += descHeight + 3;
            }
            
            const repoInfo = [];
            if (repo.language) repoInfo.push(repo.language);
            if (repo.stargazers_count !== undefined && repo.stargazers_count !== null) {
                repoInfo.push(`⭐ ${repo.stargazers_count}`);
            }
            if (repo.forks_count !== undefined && repo.forks_count !== null) {
                repoInfo.push(`🍴 ${repo.forks_count}`);
            }
            
            if (repoInfo.length > 0) {
                doc.setFontSize(9);
                doc.text(repoInfo.join(' • '), margin + 10, yPosition);
                yPosition += 6;
            }
            yPosition += 3;
        });
    }

    // Achievements Section
    if (userData.achievements && userData.achievements.length > 0) {
        checkPageBreak(30);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('ACHIEVEMENTS', margin, yPosition);
        yPosition += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        userData.achievements.forEach((achievement) => {
            checkPageBreak(8);
            doc.text(`• ${achievement}`, margin + 5, yPosition);
            yPosition += 7;
        });
    }

    // Save the PDF
    const fileName = `${userData.name || 'Resume'}_Resume.pdf`;
    doc.save(fileName);
};
