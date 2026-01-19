// Initialize form with event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle
    initThemeToggle();
    initViewToggle();
    initATSToggle();

    // Personal information listeners
    document.getElementById('fullName').addEventListener('input', queuePreviewUpdate);
    document.getElementById('title').addEventListener('input', queuePreviewUpdate);
    document.getElementById('email').addEventListener('input', queuePreviewUpdate);
    document.getElementById('phone').addEventListener('input', queuePreviewUpdate);
    document.getElementById('location').addEventListener('input', queuePreviewUpdate);
    document.getElementById('summary').addEventListener('input', queuePreviewUpdate);
    document.getElementById('objective').addEventListener('input', queuePreviewUpdate);
    document.getElementById('skills').addEventListener('input', queuePreviewUpdate);
    document.getElementById('languages').addEventListener('input', queuePreviewUpdate);
    document.getElementById('hobbies').addEventListener('input', queuePreviewUpdate);
    document.getElementById('declaration').addEventListener('input', queuePreviewUpdate);
    document.getElementById('declarationDate').addEventListener('input', queuePreviewUpdate);
    document.getElementById('includeDeclaration').addEventListener('change', queuePreviewUpdate);

    // Load from localStorage if available
    loadFromLocalStorage();
    updatePreview();

    const form = document.getElementById('cvForm');
    if (form) {
        form.addEventListener('reset', (event) => {
            const confirmReset = confirm('Reset all fields? This will clear saved data.');
            if (!confirmReset) {
                event.preventDefault();
                return;
            }
            localStorage.removeItem('cvFormData');
            setTimeout(() => {
                updatePreview();
                setSaveStatus('All changes cleared');
            }, 0);
        });
    }

    // Add initial empty sections
    if (document.getElementById('educationList').children.length === 0) {
        addEducation();
    }
    if (document.getElementById('experienceList').children.length === 0) {
        addExperience();
    }
    if (document.getElementById('projectsList').children.length === 0) {
        addProject();
    }
    if (document.getElementById('achievementsList').children.length === 0) {
        addAchievement();
    }
    if (document.getElementById('awardsList').children.length === 0) {
        addAward();
    }
    if (document.getElementById('volunteerList').children.length === 0) {
        addVolunteer();
    }
    if (document.getElementById('conferencesList').children.length === 0) {
        addConference();
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('sample') === '1') {
        loadSampleCV();
    }
});

let previewUpdateTimer = null;

function queuePreviewUpdate() {
    window.clearTimeout(previewUpdateTimer);
    previewUpdateTimer = window.setTimeout(() => {
        updatePreview();
    }, 150);
}

function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    const savedTheme = localStorage.getItem('cvTheme');
    if (savedTheme) {
        document.body.dataset.theme = savedTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.dataset.theme = 'dark';
    }

    updateThemeToggleLabel(toggle, document.body.dataset.theme === 'dark');

    toggle.addEventListener('click', () => {
        const isDark = document.body.dataset.theme === 'dark';
        if (isDark) {
            delete document.body.dataset.theme;
            localStorage.removeItem('cvTheme');
        } else {
            document.body.dataset.theme = 'dark';
            localStorage.setItem('cvTheme', 'dark');
        }
        updateThemeToggleLabel(toggle, !isDark);
    });
}

function updateThemeToggleLabel(toggle, isDark) {
    const icon = toggle.querySelector('i');
    const label = toggle.querySelector('span');
    if (icon) {
        icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
    if (label) {
        label.textContent = isDark ? 'Light' : 'Dark';
    }
}

function initViewToggle() {
    const buttons = Array.from(document.querySelectorAll('.view-toggle'));
    if (buttons.length === 0) return;

    const applyView = (view) => {
        document.body.dataset.view = view;
        buttons.forEach(btn => {
            const isActive = btn.dataset.view === view;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    };

    // Default to form on small screens
    const prefersPreview = document.body.dataset.view;
    if (!prefersPreview) {
        applyView('form');
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => applyView(btn.dataset.view));
    });

    const media = window.matchMedia('(max-width: 900px)');
    const handleResize = () => {
        if (!media.matches) {
            delete document.body.dataset.view;
        } else if (!document.body.dataset.view) {
            applyView('form');
        }
    };

    handleResize();
    media.addEventListener('change', handleResize);
}

function initATSToggle() {
    const toggle = document.getElementById('atsToggle');
    if (!toggle) return;

    const saved = localStorage.getItem('cvATS');
    if (saved === 'true') {
        document.body.dataset.ats = 'true';
        toggle.classList.add('active');
        toggle.setAttribute('aria-pressed', 'true');
        updateATSToggleLabel(toggle, true);
    }

    toggle.addEventListener('click', () => {
        const isActive = document.body.dataset.ats === 'true';
        if (isActive) {
            delete document.body.dataset.ats;
            localStorage.removeItem('cvATS');
        } else {
            document.body.dataset.ats = 'true';
            localStorage.setItem('cvATS', 'true');
        }
        toggle.classList.toggle('active', !isActive);
        toggle.setAttribute('aria-pressed', (!isActive).toString());
        updateATSToggleLabel(toggle, !isActive);
    });
}

function updateATSToggleLabel(toggle, isActive) {
    const label = toggle.querySelector('span');
    if (label) {
        label.textContent = isActive ? 'ATS On' : 'ATS';
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('success', 'error');
    toast.classList.add(type === 'error' ? 'error' : 'success');
    toast.classList.add('show');
    window.clearTimeout(toast._timer);
    toast._timer = window.setTimeout(() => {
        toast.classList.remove('show');
    }, 2200);
}

// Education Management
function addEducation() {
    const educationList = document.getElementById('educationList');
    const id = Date.now();
    const html = `
        <div class="form-array-item" id="education-${id}">
            <div class="form-group">
                <label for="education-degree-${id}">Degree/Qualification *</label>
                <input type="text" id="education-degree-${id}" class="education-degree" placeholder="e.g., B.Pharma" required onchange="queuePreviewUpdate()">
            </div>
            <div class="two-column">
                <div class="form-group">
                    <label for="education-institution-${id}">Institution</label>
                    <input type="text" id="education-institution-${id}" class="education-institution" placeholder="e.g., IIMT College of Medical Science" onchange="queuePreviewUpdate()">
                </div>
                <div class="form-group">
                    <label for="education-year-${id}">Year of Completion</label>
                    <input type="text" id="education-year-${id}" class="education-year" placeholder="e.g., 2022" onchange="queuePreviewUpdate()">
                </div>
            </div>
            <div class="form-group">
                <label for="education-details-${id}">Details</label>
                <textarea id="education-details-${id}" class="education-details" placeholder="Additional details about the program..." onchange="queuePreviewUpdate()"></textarea>
            </div>
            <button type="button" class="remove-btn" onclick="removeEducation(${id})">Remove</button>
        </div>
    `;
    educationList.insertAdjacentHTML('beforeend', html);
    updatePreview();
}

function removeEducation(id) {
    document.getElementById(`education-${id}`).remove();
    updatePreview();
}

// Experience Management
function addExperience() {
    const experienceList = document.getElementById('experienceList');
    const id = Date.now();
    const html = `
        <div class="form-array-item" id="experience-${id}">
            <div class="two-column">
                <div class="form-group">
                    <label for="experience-title-${id}">Job Title *</label>
                    <input type="text" id="experience-title-${id}" class="experience-title" placeholder="e.g., QA Officer" required onchange="queuePreviewUpdate()">
                </div>
                <div class="form-group">
                    <label for="experience-company-${id}">Company</label>
                    <input type="text" id="experience-company-${id}" class="experience-company" placeholder="e.g., Troikaa Pharmaceuticals Ltd." onchange="queuePreviewUpdate()">
                </div>
            </div>
            <div class="two-column">
                <div class="form-group">
                    <label for="experience-start-${id}">Start Date</label>
                    <input type="text" id="experience-start-${id}" class="experience-start" placeholder="e.g., March 2022" onchange="queuePreviewUpdate()">
                </div>
                <div class="form-group">
                    <label for="experience-end-${id}">End Date</label>
                    <input type="text" id="experience-end-${id}" class="experience-end" placeholder="e.g., Present" onchange="queuePreviewUpdate()">
                </div>
            </div>
            <div class="form-group">
                <label for="experience-location-${id}">Location</label>
                <input type="text" id="experience-location-${id}" class="experience-location" placeholder="e.g., Dehradun, UK" onchange="queuePreviewUpdate()">
            </div>
            <div class="form-group">
                <label for="experience-description-${id}">Description/Responsibilities</label>
                <textarea id="experience-description-${id}" class="experience-description" placeholder="Describe your responsibilities and achievements (use line breaks for bullet points)..." onchange="queuePreviewUpdate()"></textarea>
            </div>
            <button type="button" class="remove-btn" onclick="removeExperience(${id})">Remove</button>
        </div>
    `;
    experienceList.insertAdjacentHTML('beforeend', html);
    updatePreview();
}

function removeExperience(id) {
    document.getElementById(`experience-${id}`).remove();
    updatePreview();
}

// Project Management
function addProject() {
    const projectsList = document.getElementById('projectsList');
    const id = Date.now();
    const html = `
        <div class="form-array-item" id="project-${id}">
            <div class="two-column">
                <div class="form-group">
                    <label for="project-title-${id}">Project Title *</label>
                    <input type="text" id="project-title-${id}" class="project-title" placeholder="e.g., Batch Review Automation" required onchange="queuePreviewUpdate()">
                </div>
                <div class="form-group">
                    <label for="project-role-${id}">Role/Type</label>
                    <input type="text" id="project-role-${id}" class="project-role" placeholder="e.g., Lead QA, Personal Project" onchange="queuePreviewUpdate()">
                </div>
            </div>
            <div class="two-column">
                <div class="form-group">
                    <label for="project-date-${id}">Date/Duration</label>
                    <input type="text" id="project-date-${id}" class="project-date" placeholder="e.g., 2024 - Present" onchange="queuePreviewUpdate()">
                </div>
                <div class="form-group">
                    <label for="project-link-${id}">Link (optional)</label>
                    <input type="text" id="project-link-${id}" class="project-link" placeholder="e.g., github.com/username/project" onchange="queuePreviewUpdate()">
                </div>
            </div>
            <div class="form-group">
                <label for="project-description-${id}">Description</label>
                <textarea id="project-description-${id}" class="project-description" placeholder="Outcome, scope, tools used (use line breaks for bullet points)..." onchange="queuePreviewUpdate()"></textarea>
            </div>
            <button type="button" class="remove-btn" onclick="removeProject(${id})">Remove</button>
        </div>
    `;
    projectsList.insertAdjacentHTML('beforeend', html);
    updatePreview();
}

function removeProject(id) {
    document.getElementById(`project-${id}`).remove();
    updatePreview();
}

// Achievement Management
function addAchievement() {
    const achievementsList = document.getElementById('achievementsList');
    const id = Date.now();
    const html = `
        <div class="form-array-item" id="achievement-${id}">
            <div class="two-column">
                <div class="form-group">
                    <label for="achievement-title-${id}">Achievement *</label>
                    <input type="text" id="achievement-title-${id}" class="achievement-title" placeholder="e.g., Reduced batch deviations by 22%" required onchange="queuePreviewUpdate()">
                </div>
                <div class="form-group">
                    <label for="achievement-date-${id}">Date</label>
                    <input type="text" id="achievement-date-${id}" class="achievement-date" placeholder="e.g., 2023" onchange="queuePreviewUpdate()">
                </div>
            </div>
            <div class="form-group">
                <label for="achievement-details-${id}">Details</label>
                <textarea id="achievement-details-${id}" class="achievement-details" placeholder="Impact, metrics, recognition (use line breaks for bullet points)..." onchange="queuePreviewUpdate()"></textarea>
            </div>
            <button type="button" class="remove-btn" onclick="removeAchievement(${id})">Remove</button>
        </div>
    `;
    achievementsList.insertAdjacentHTML('beforeend', html);
    updatePreview();
}

function removeAchievement(id) {
    document.getElementById(`achievement-${id}`).remove();
    updatePreview();
}

// Certification Management
function addCertification() {
    const certificationsList = document.getElementById('certificationsList');
    const id = Date.now();
    const html = `
        <div class="form-array-item" id="certification-${id}">
            <div class="two-column">
                <div class="form-group">
                    <label for="certification-name-${id}">Certification Name</label>
                    <input type="text" id="certification-name-${id}" class="certification-name" placeholder="e.g., cGMP Certified" onchange="queuePreviewUpdate()">
                </div>
                <div class="form-group">
                    <label for="certification-org-${id}">Issuing Organization</label>
                    <input type="text" id="certification-org-${id}" class="certification-org" placeholder="e.g., WHO" onchange="queuePreviewUpdate()">
                </div>
            </div>
            <div class="form-group">
                <label for="certification-date-${id}">Date Obtained</label>
                <input type="text" id="certification-date-${id}" class="certification-date" placeholder="e.g., 2022" onchange="queuePreviewUpdate()">
            </div>
            <button type="button" class="remove-btn" onclick="removeCertification(${id})">Remove</button>
        </div>
    `;
    certificationsList.insertAdjacentHTML('beforeend', html);
    updatePreview();
}

function removeCertification(id) {
    document.getElementById(`certification-${id}`).remove();
    updatePreview();
}

// Awards Management
function addAward() {
    const awardsList = document.getElementById('awardsList');
    const id = Date.now();
    const html = `
        <div class="form-array-item" id="award-${id}">
            <div class="two-column">
                <div class="form-group">
                    <label for="award-title-${id}">Award/Honor *</label>
                    <input type="text" id="award-title-${id}" class="award-title" placeholder="e.g., Employee of the Year" required onchange="queuePreviewUpdate()">
                </div>
                <div class="form-group">
                    <label for="award-date-${id}">Date</label>
                    <input type="text" id="award-date-${id}" class="award-date" placeholder="e.g., 2022" onchange="queuePreviewUpdate()">
                </div>
            </div>
            <div class="form-group">
                <label for="award-issuer-${id}">Issuer</label>
                <input type="text" id="award-issuer-${id}" class="award-issuer" placeholder="e.g., Troikaa Pharmaceuticals Ltd." onchange="queuePreviewUpdate()">
            </div>
            <div class="form-group">
                <label for="award-details-${id}">Details</label>
                <textarea id="award-details-${id}" class="award-details" placeholder="Reason or scope (use line breaks for bullet points)..." onchange="queuePreviewUpdate()"></textarea>
            </div>
            <button type="button" class="remove-btn" onclick="removeAward(${id})">Remove</button>
        </div>
    `;
    awardsList.insertAdjacentHTML('beforeend', html);
    updatePreview();
}

function removeAward(id) {
    document.getElementById(`award-${id}`).remove();
    updatePreview();
}

// Volunteer Management
function addVolunteer() {
    const volunteerList = document.getElementById('volunteerList');
    const id = Date.now();
    const html = `
        <div class="form-array-item" id="volunteer-${id}">
            <div class="two-column">
                <div class="form-group">
                    <label for="volunteer-role-${id}">Role *</label>
                    <input type="text" id="volunteer-role-${id}" class="volunteer-role" placeholder="e.g., Event Coordinator" required onchange="queuePreviewUpdate()">
                </div>
                <div class="form-group">
                    <label for="volunteer-org-${id}">Organization</label>
                    <input type="text" id="volunteer-org-${id}" class="volunteer-org" placeholder="e.g., Red Cross" onchange="queuePreviewUpdate()">
                </div>
            </div>
            <div class="two-column">
                <div class="form-group">
                    <label for="volunteer-start-${id}">Start Date</label>
                    <input type="text" id="volunteer-start-${id}" class="volunteer-start" placeholder="e.g., Jan 2021" onchange="queuePreviewUpdate()">
                </div>
                <div class="form-group">
                    <label for="volunteer-end-${id}">End Date</label>
                    <input type="text" id="volunteer-end-${id}" class="volunteer-end" placeholder="e.g., Present" onchange="queuePreviewUpdate()">
                </div>
            </div>
            <div class="form-group">
                <label for="volunteer-description-${id}">Description</label>
                <textarea id="volunteer-description-${id}" class="volunteer-description" placeholder="Impact, responsibilities (use line breaks for bullet points)..." onchange="queuePreviewUpdate()"></textarea>
            </div>
            <button type="button" class="remove-btn" onclick="removeVolunteer(${id})">Remove</button>
        </div>
    `;
    volunteerList.insertAdjacentHTML('beforeend', html);
    updatePreview();
}

function removeVolunteer(id) {
    document.getElementById(`volunteer-${id}`).remove();
    updatePreview();
}

// Conference Management
function addConference() {
    const conferencesList = document.getElementById('conferencesList');
    const id = Date.now();
    const html = `
        <div class="form-array-item" id="conference-${id}">
            <div class="two-column">
                <div class="form-group">
                    <label for="conference-name-${id}">Conference *</label>
                    <input type="text" id="conference-name-${id}" class="conference-name" placeholder="e.g., Pharma Quality Summit" required onchange="queuePreviewUpdate()">
                </div>
                <div class="form-group">
                    <label for="conference-year-${id}">Year</label>
                    <input type="text" id="conference-year-${id}" class="conference-year" placeholder="e.g., 2023" onchange="queuePreviewUpdate()">
                </div>
            </div>
            <div class="form-group">
                <label for="conference-location-${id}">Location</label>
                <input type="text" id="conference-location-${id}" class="conference-location" placeholder="e.g., Delhi, India" onchange="queuePreviewUpdate()">
            </div>
            <div class="form-group">
                <label for="conference-notes-${id}">Topic/Notes</label>
                <textarea id="conference-notes-${id}" class="conference-notes" placeholder="Talk topic, workshop, or key learnings..." onchange="queuePreviewUpdate()"></textarea>
            </div>
            <button type="button" class="remove-btn" onclick="removeConference(${id})">Remove</button>
        </div>
    `;
    conferencesList.insertAdjacentHTML('beforeend', html);
    updatePreview();
}

function removeConference(id) {
    document.getElementById(`conference-${id}`).remove();
    updatePreview();
}

// Update preview in real-time
function updatePreview() {
    // Update header
    const fullName = document.getElementById('fullName').value || 'Your Name';
    const title = document.getElementById('title').value || 'Professional Title';
    
    document.getElementById('previewName').textContent = fullName;
    document.getElementById('previewTitle').textContent = title;

    // Update contact info
    updateContactInfo();

    // Update summary
    const summary = document.getElementById('summary').value;
    if (summary.trim()) {
        document.getElementById('summarySection').style.display = 'block';
        document.getElementById('previewSummary').textContent = summary;
    } else {
        document.getElementById('summarySection').style.display = 'none';
    }

    // Update objective
    const objective = document.getElementById('objective').value;
    if (objective.trim()) {
        document.getElementById('objectiveSection').style.display = 'block';
        document.getElementById('previewObjective').textContent = objective;
    } else {
        document.getElementById('objectiveSection').style.display = 'none';
    }

    // Update experience
    updateExperiencePreview();

    // Update education
    updateEducationPreview();

    // Update skills
    updateSkillsPreview();

    // Update projects
    updateProjectsPreview();

    // Update certifications
    updateCertificationsPreview();

    // Update achievements
    updateAchievementsPreview();

    // Update awards
    updateAwardsPreview();

    // Update volunteer work
    updateVolunteerPreview();

    // Update conferences
    updateConferencesPreview();

    // Update languages
    updateLanguagesPreview();

    // Update hobbies
    updateHobbiesPreview();

    // Update declaration
    const declaration = document.getElementById('declaration').value;
    const declarationDate = document.getElementById('declarationDate').value;
    const includeDeclaration = document.getElementById('includeDeclaration').checked;
    if (includeDeclaration && declaration.trim()) {
        document.getElementById('declarationSection').style.display = 'block';
        document.getElementById('previewDeclaration').textContent = declaration;
        document.getElementById('previewDeclarationDate').textContent = declarationDate || '';
        document.getElementById('previewDeclarationSignature').textContent = fullName !== 'Your Name' ? fullName : '';
    } else {
        document.getElementById('declarationSection').style.display = 'none';
        document.getElementById('previewDeclarationDate').textContent = '';
        document.getElementById('previewDeclarationSignature').textContent = '';
    }

    // Save to localStorage
    saveToLocalStorage();
}

function updateContactInfo() {
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const location = document.getElementById('location').value;

    let contactHTML = '';
    const contacts = [];
    if (email) contacts.push(email);
    if (phone) contacts.push(phone);
    if (location) contacts.push(location);

    if (contacts.length > 0) {
        contactHTML = contacts.join(' • ');
    } else {
        contactHTML = 'Email • Phone • Location';
    }

    document.getElementById('previewContactContent').textContent = contactHTML;
}

function updateEducationPreview() {
    const educationList = document.getElementById('educationList');
    const educationItems = educationList.querySelectorAll('.form-array-item');
    let html = '';
    let hasContent = false;

    educationItems.forEach(item => {
        const degree = item.querySelector('.education-degree').value;
        const institution = item.querySelector('.education-institution').value;
        const year = item.querySelector('.education-year').value;
        const details = item.querySelector('.education-details').value;

        if (degree || institution || year) {
            hasContent = true;
            html += `
                <div class="cv-item">
                    <div class="cv-item-header">
                        <div class="cv-item-title">${degree}</div>
                        <div class="cv-item-date">${year}</div>
                    </div>
                    ${institution ? `<div class="cv-item-subtitle">${institution}</div>` : ''}
                    ${details ? `<div class="cv-item-description">${details}</div>` : ''}
                </div>
            `;
        }
    });

    if (hasContent) {
        document.getElementById('educationSection').style.display = 'block';
        document.getElementById('previewEducation').innerHTML = html;
    } else {
        document.getElementById('educationSection').style.display = 'none';
    }
}

function updateExperiencePreview() {
    const experienceList = document.getElementById('experienceList');
    const experienceItems = experienceList.querySelectorAll('.form-array-item');
    let html = '';
    let hasContent = false;

    experienceItems.forEach(item => {
        const title = item.querySelector('.experience-title').value;
        const company = item.querySelector('.experience-company').value;
        const start = item.querySelector('.experience-start').value;
        const end = item.querySelector('.experience-end').value;
        const location = item.querySelector('.experience-location').value;
        const description = item.querySelector('.experience-description').value;

        if (title || company) {
            hasContent = true;
            const dateRange = [start, end].filter(d => d).join(' - ') || '';
            
            let descriptionHTML = '';
            if (description) {
                const lines = description.split('\n').filter(l => l.trim());
                if (lines.length > 0) {
                    descriptionHTML = lines.map(line => `<div class="cv-item-bullet">${line.trim()}</div>`).join('');
                }
            }

            html += `
                <div class="cv-item">
                    <div class="cv-item-header">
                        <div class="cv-item-title">${title}</div>
                        <div class="cv-item-date">${dateRange}</div>
                    </div>
                    ${company ? `<div class="cv-item-subtitle">${company}</div>` : ''}
                    ${location ? `<div style="font-size: 12px; color: #666;">${location}</div>` : ''}
                    ${descriptionHTML ? `<div>${descriptionHTML}</div>` : ''}
                </div>
            `;
        }
    });

    if (hasContent) {
        document.getElementById('experienceSection').style.display = 'block';
        document.getElementById('previewExperience').innerHTML = html;
    } else {
        document.getElementById('experienceSection').style.display = 'none';
    }
}

function updateProjectsPreview() {
    const projectsList = document.getElementById('projectsList');
    const projectItems = projectsList.querySelectorAll('.form-array-item');
    let html = '';
    let hasContent = false;

    projectItems.forEach(item => {
        const title = item.querySelector('.project-title').value;
        const role = item.querySelector('.project-role').value;
        const date = item.querySelector('.project-date').value;
        const link = item.querySelector('.project-link').value;
        const description = item.querySelector('.project-description').value;

        if (title || role) {
            hasContent = true;

            let descriptionHTML = '';
            if (description) {
                const lines = description.split('\n').filter(l => l.trim());
                if (lines.length > 0) {
                    descriptionHTML = lines.map(line => `<div class="cv-item-bullet">${line.trim()}</div>`).join('');
                }
            }

            html += `
                <div class="cv-item">
                    <div class="cv-item-header">
                        <div class="cv-item-title">${title}</div>
                        <div class="cv-item-date">${date}</div>
                    </div>
                    ${role ? `<div class="cv-item-subtitle">${role}</div>` : ''}
                    ${link ? `<div style="font-size: 10pt; color: #000000;">${link}</div>` : ''}
                    ${descriptionHTML ? `<div>${descriptionHTML}</div>` : ''}
                </div>
            `;
        }
    });

    if (hasContent) {
        document.getElementById('projectsSection').style.display = 'block';
        document.getElementById('previewProjects').innerHTML = html;
    } else {
        document.getElementById('projectsSection').style.display = 'none';
    }
}

function updateSkillsPreview() {
    const skills = document.getElementById('skills').value;
    if (skills.trim()) {
        document.getElementById('skillsSection').style.display = 'block';
        const skillsList = skills.split(',').map(s => s.trim()).filter(s => s);
        const skillsHTML = skillsList.map(skill => `<div class="cv-item-bullet">${skill}</div>`).join('');
        document.getElementById('previewSkills').innerHTML = skillsHTML;
    } else {
        document.getElementById('skillsSection').style.display = 'none';
    }
}

function updateAchievementsPreview() {
    const achievementsList = document.getElementById('achievementsList');
    const achievementItems = achievementsList.querySelectorAll('.form-array-item');
    let html = '';
    let hasContent = false;

    achievementItems.forEach(item => {
        const title = item.querySelector('.achievement-title').value;
        const date = item.querySelector('.achievement-date').value;
        const details = item.querySelector('.achievement-details').value;

        if (title || details) {
            hasContent = true;

            let detailsHTML = '';
            if (details) {
                const lines = details.split('\n').filter(l => l.trim());
                if (lines.length > 0) {
                    detailsHTML = lines.map(line => `<div class="cv-item-bullet">${line.trim()}</div>`).join('');
                }
            }

            html += `
                <div class="cv-item">
                    <div class="cv-item-header">
                        <div class="cv-item-title">${title}</div>
                        <div class="cv-item-date">${date}</div>
                    </div>
                    ${detailsHTML ? `<div>${detailsHTML}</div>` : ''}
                </div>
            `;
        }
    });

    if (hasContent) {
        document.getElementById('achievementsSection').style.display = 'block';
        document.getElementById('previewAchievements').innerHTML = html;
    } else {
        document.getElementById('achievementsSection').style.display = 'none';
    }
}

function updateCertificationsPreview() {
    const certificationsList = document.getElementById('certificationsList');
    const certificationItems = certificationsList.querySelectorAll('.form-array-item');
    let html = '';
    let hasContent = false;

    certificationItems.forEach(item => {
        const name = item.querySelector('.certification-name').value;
        const org = item.querySelector('.certification-org').value;
        const date = item.querySelector('.certification-date').value;

        if (name || org) {
            hasContent = true;
            html += `
                <div class="cv-item">
                    <div class="cv-item-header">
                        <div class="cv-item-title">${name}</div>
                        <div class="cv-item-date">${date}</div>
                    </div>
                    ${org ? `<div class="cv-item-subtitle">${org}</div>` : ''}
                </div>
            `;
        }
    });

    if (hasContent) {
        document.getElementById('certificationsSection').style.display = 'block';
        document.getElementById('previewCertifications').innerHTML = html;
    } else {
        document.getElementById('certificationsSection').style.display = 'none';
    }
}

function updateLanguagesPreview() {
    const languages = document.getElementById('languages').value;
    if (languages.trim()) {
        document.getElementById('languagesSection').style.display = 'block';
        const languagesList = languages.split(',').map(l => l.trim()).filter(l => l);
        const languagesHTML = languagesList.map(lang => `<div class="cv-item-bullet">${lang}</div>`).join('');
        document.getElementById('previewLanguages').innerHTML = languagesHTML;
    } else {
        document.getElementById('languagesSection').style.display = 'none';
    }
}

function updateHobbiesPreview() {
    const hobbies = document.getElementById('hobbies').value;
    if (hobbies.trim()) {
        document.getElementById('hobbiesSection').style.display = 'block';
        const hobbiesList = hobbies.split(',').map(h => h.trim()).filter(h => h);
        const hobbiesHTML = hobbiesList.map(hobby => `<div class="cv-item-bullet">${hobby}</div>`).join('');
        document.getElementById('previewHobbies').innerHTML = hobbiesHTML;
    } else {
        document.getElementById('hobbiesSection').style.display = 'none';
    }
}

function updateAwardsPreview() {
    const awardsList = document.getElementById('awardsList');
    const awardItems = awardsList.querySelectorAll('.form-array-item');
    let html = '';
    let hasContent = false;

    awardItems.forEach(item => {
        const title = item.querySelector('.award-title').value;
        const date = item.querySelector('.award-date').value;
        const issuer = item.querySelector('.award-issuer').value;
        const details = item.querySelector('.award-details').value;

        if (title || issuer) {
            hasContent = true;

            let detailsHTML = '';
            if (details) {
                const lines = details.split('\n').filter(l => l.trim());
                if (lines.length > 0) {
                    detailsHTML = lines.map(line => `<div class="cv-item-bullet">${line.trim()}</div>`).join('');
                }
            }

            html += `
                <div class="cv-item">
                    <div class="cv-item-header">
                        <div class="cv-item-title">${title}</div>
                        <div class="cv-item-date">${date}</div>
                    </div>
                    ${issuer ? `<div class="cv-item-subtitle">${issuer}</div>` : ''}
                    ${detailsHTML ? `<div>${detailsHTML}</div>` : ''}
                </div>
            `;
        }
    });

    if (hasContent) {
        document.getElementById('awardsSection').style.display = 'block';
        document.getElementById('previewAwards').innerHTML = html;
    } else {
        document.getElementById('awardsSection').style.display = 'none';
    }
}

function updateVolunteerPreview() {
    const volunteerList = document.getElementById('volunteerList');
    const volunteerItems = volunteerList.querySelectorAll('.form-array-item');
    let html = '';
    let hasContent = false;

    volunteerItems.forEach(item => {
        const role = item.querySelector('.volunteer-role').value;
        const org = item.querySelector('.volunteer-org').value;
        const start = item.querySelector('.volunteer-start').value;
        const end = item.querySelector('.volunteer-end').value;
        const description = item.querySelector('.volunteer-description').value;

        if (role || org) {
            hasContent = true;
            const dateRange = [start, end].filter(d => d).join(' - ') || '';

            let descriptionHTML = '';
            if (description) {
                const lines = description.split('\n').filter(l => l.trim());
                if (lines.length > 0) {
                    descriptionHTML = lines.map(line => `<div class="cv-item-bullet">${line.trim()}</div>`).join('');
                }
            }

            html += `
                <div class="cv-item">
                    <div class="cv-item-header">
                        <div class="cv-item-title">${role}</div>
                        <div class="cv-item-date">${dateRange}</div>
                    </div>
                    ${org ? `<div class="cv-item-subtitle">${org}</div>` : ''}
                    ${descriptionHTML ? `<div>${descriptionHTML}</div>` : ''}
                </div>
            `;
        }
    });

    if (hasContent) {
        document.getElementById('volunteerSection').style.display = 'block';
        document.getElementById('previewVolunteer').innerHTML = html;
    } else {
        document.getElementById('volunteerSection').style.display = 'none';
    }
}

function updateConferencesPreview() {
    const conferencesList = document.getElementById('conferencesList');
    const conferenceItems = conferencesList.querySelectorAll('.form-array-item');
    let html = '';
    let hasContent = false;

    conferenceItems.forEach(item => {
        const name = item.querySelector('.conference-name').value;
        const year = item.querySelector('.conference-year').value;
        const location = item.querySelector('.conference-location').value;
        const notes = item.querySelector('.conference-notes').value;

        if (name || location) {
            hasContent = true;

            html += `
                <div class="cv-item">
                    <div class="cv-item-header">
                        <div class="cv-item-title">${name}</div>
                        <div class="cv-item-date">${year}</div>
                    </div>
                    ${location ? `<div class="cv-item-subtitle">${location}</div>` : ''}
                    ${notes ? `<div class="cv-item-description">${notes}</div>` : ''}
                </div>
            `;
        }
    });

    if (hasContent) {
        document.getElementById('conferencesSection').style.display = 'block';
        document.getElementById('previewConferences').innerHTML = html;
    } else {
        document.getElementById('conferencesSection').style.display = 'none';
    }
}

// Export to PDF
function exportPDF() {
    if (!validateForm()) {
        return;
    }

    const element = document.getElementById('cvPreview');
    const fullName = document.getElementById('fullName').value || 'CV';
    
    const opt = {
        margin: [0.001, 0.001, 0.001,0.001],
        filename: `${fullName.replace(/\s+/g, '_')}_CV.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    document.body.classList.add('exporting');
    html2pdf().set(opt).from(element).save().finally(() => {
        document.body.classList.remove('exporting');
    });
}

// LocalStorage Management
function saveToLocalStorage() {
    const formData = {
        fullName: document.getElementById('fullName').value,
        title: document.getElementById('title').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        location: document.getElementById('location').value,
        summary: document.getElementById('summary').value,
        objective: document.getElementById('objective').value,
        skills: document.getElementById('skills').value,
        languages: document.getElementById('languages').value,
        hobbies: document.getElementById('hobbies').value,
        declaration: document.getElementById('declaration').value,
        declarationDate: document.getElementById('declarationDate').value,
        includeDeclaration: document.getElementById('includeDeclaration').checked,
        education: [],
        experience: [],
        projects: [],
        achievements: [],
        certifications: [],
        awards: [],
        volunteer: [],
        conferences: []
    };

    // Collect education
    document.querySelectorAll('#educationList .form-array-item').forEach(item => {
        formData.education.push({
            degree: item.querySelector('.education-degree').value,
            institution: item.querySelector('.education-institution').value,
            year: item.querySelector('.education-year').value,
            details: item.querySelector('.education-details').value
        });
    });

    // Collect experience
    document.querySelectorAll('#experienceList .form-array-item').forEach(item => {
        formData.experience.push({
            title: item.querySelector('.experience-title').value,
            company: item.querySelector('.experience-company').value,
            start: item.querySelector('.experience-start').value,
            end: item.querySelector('.experience-end').value,
            location: item.querySelector('.experience-location').value,
            description: item.querySelector('.experience-description').value
        });
    });

    // Collect projects
    document.querySelectorAll('#projectsList .form-array-item').forEach(item => {
        formData.projects.push({
            title: item.querySelector('.project-title').value,
            role: item.querySelector('.project-role').value,
            date: item.querySelector('.project-date').value,
            link: item.querySelector('.project-link').value,
            description: item.querySelector('.project-description').value
        });
    });

    // Collect achievements
    document.querySelectorAll('#achievementsList .form-array-item').forEach(item => {
        formData.achievements.push({
            title: item.querySelector('.achievement-title').value,
            date: item.querySelector('.achievement-date').value,
            details: item.querySelector('.achievement-details').value
        });
    });

    // Collect certifications
    document.querySelectorAll('#certificationsList .form-array-item').forEach(item => {
        formData.certifications.push({
            name: item.querySelector('.certification-name').value,
            org: item.querySelector('.certification-org').value,
            date: item.querySelector('.certification-date').value
        });
    });

    // Collect awards
    document.querySelectorAll('#awardsList .form-array-item').forEach(item => {
        formData.awards.push({
            title: item.querySelector('.award-title').value,
            issuer: item.querySelector('.award-issuer').value,
            date: item.querySelector('.award-date').value,
            details: item.querySelector('.award-details').value
        });
    });

    // Collect volunteer work
    document.querySelectorAll('#volunteerList .form-array-item').forEach(item => {
        formData.volunteer.push({
            role: item.querySelector('.volunteer-role').value,
            org: item.querySelector('.volunteer-org').value,
            start: item.querySelector('.volunteer-start').value,
            end: item.querySelector('.volunteer-end').value,
            description: item.querySelector('.volunteer-description').value
        });
    });

    // Collect conferences
    document.querySelectorAll('#conferencesList .form-array-item').forEach(item => {
        formData.conferences.push({
            name: item.querySelector('.conference-name').value,
            year: item.querySelector('.conference-year').value,
            location: item.querySelector('.conference-location').value,
            notes: item.querySelector('.conference-notes').value
        });
    });

    localStorage.setItem('cvFormData', JSON.stringify(formData));
    setSaveStatus('All changes saved');
}

function setSaveStatus(message) {
    const status = document.getElementById('saveStatus');
    if (!status) return;
    status.textContent = message;
    status.classList.add('pulse');
    window.clearTimeout(status._pulseTimer);
    status._pulseTimer = window.setTimeout(() => {
        status.classList.remove('pulse');
    }, 800);
}

function validateForm() {
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

    let isValid = true;
    const requiredStatic = ['fullName', 'title'];
    requiredStatic.forEach(id => {
        const field = document.getElementById(id);
        if (field && !field.value.trim()) {
            field.classList.add('input-error');
            isValid = false;
        }
    });

    document.querySelectorAll('.form-array-item').forEach(item => {
        const fields = Array.from(item.querySelectorAll('input, textarea'));
        const hasValue = fields.some(field => field.value.trim());
        if (!hasValue) return;

        item.querySelectorAll('[required]').forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('input-error');
                isValid = false;
            }
        });
    });

    if (!isValid) {
        const first = document.querySelector('.input-error');
        if (first) {
            first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        showToast('Please fill all required fields before exporting.', 'error');
    }

    return isValid;
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('cvFormData');
    if (!saved) return;

    const formData = JSON.parse(saved);

    // Load personal info
    document.getElementById('fullName').value = formData.fullName || '';
    document.getElementById('title').value = formData.title || '';
    document.getElementById('email').value = formData.email || '';
    document.getElementById('phone').value = formData.phone || '';
    document.getElementById('location').value = formData.location || '';
    document.getElementById('summary').value = formData.summary || '';
    document.getElementById('objective').value = formData.objective || '';
    document.getElementById('skills').value = formData.skills || '';
    document.getElementById('languages').value = formData.languages || '';
    document.getElementById('hobbies').value = formData.hobbies || '';
    document.getElementById('declaration').value = formData.declaration || '';
    document.getElementById('declarationDate').value = formData.declarationDate || '';
    document.getElementById('includeDeclaration').checked = formData.includeDeclaration !== false;

    // Clear and reload education
    document.getElementById('educationList').innerHTML = '';
    if (formData.education && formData.education.length > 0) {
        formData.education.forEach(edu => {
            addEducation();
            const lastItem = document.getElementById('educationList').lastElementChild;
            lastItem.querySelector('.education-degree').value = edu.degree || '';
            lastItem.querySelector('.education-institution').value = edu.institution || '';
            lastItem.querySelector('.education-year').value = edu.year || '';
            lastItem.querySelector('.education-details').value = edu.details || '';
        });
    }

    // Clear and reload experience
    document.getElementById('experienceList').innerHTML = '';
    if (formData.experience && formData.experience.length > 0) {
        formData.experience.forEach(exp => {
            addExperience();
            const lastItem = document.getElementById('experienceList').lastElementChild;
            lastItem.querySelector('.experience-title').value = exp.title || '';
            lastItem.querySelector('.experience-company').value = exp.company || '';
            lastItem.querySelector('.experience-start').value = exp.start || '';
            lastItem.querySelector('.experience-end').value = exp.end || '';
            lastItem.querySelector('.experience-location').value = exp.location || '';
            lastItem.querySelector('.experience-description').value = exp.description || '';
        });
    }

    // Clear and reload projects
    document.getElementById('projectsList').innerHTML = '';
    if (formData.projects && formData.projects.length > 0) {
        formData.projects.forEach(project => {
            addProject();
            const lastItem = document.getElementById('projectsList').lastElementChild;
            lastItem.querySelector('.project-title').value = project.title || '';
            lastItem.querySelector('.project-role').value = project.role || '';
            lastItem.querySelector('.project-date').value = project.date || '';
            lastItem.querySelector('.project-link').value = project.link || '';
            lastItem.querySelector('.project-description').value = project.description || '';
        });
    }

    // Clear and reload achievements
    document.getElementById('achievementsList').innerHTML = '';
    if (formData.achievements && formData.achievements.length > 0) {
        formData.achievements.forEach(achievement => {
            addAchievement();
            const lastItem = document.getElementById('achievementsList').lastElementChild;
            lastItem.querySelector('.achievement-title').value = achievement.title || '';
            lastItem.querySelector('.achievement-date').value = achievement.date || '';
            lastItem.querySelector('.achievement-details').value = achievement.details || '';
        });
    }

    // Clear and reload certifications
    document.getElementById('certificationsList').innerHTML = '';
    if (formData.certifications && formData.certifications.length > 0) {
        formData.certifications.forEach(cert => {
            addCertification();
            const lastItem = document.getElementById('certificationsList').lastElementChild;
            lastItem.querySelector('.certification-name').value = cert.name || '';
            lastItem.querySelector('.certification-org').value = cert.org || '';
            lastItem.querySelector('.certification-date').value = cert.date || '';
        });
    }

    // Clear and reload awards
    document.getElementById('awardsList').innerHTML = '';
    if (formData.awards && formData.awards.length > 0) {
        formData.awards.forEach(award => {
            addAward();
            const lastItem = document.getElementById('awardsList').lastElementChild;
            lastItem.querySelector('.award-title').value = award.title || '';
            lastItem.querySelector('.award-issuer').value = award.issuer || '';
            lastItem.querySelector('.award-date').value = award.date || '';
            lastItem.querySelector('.award-details').value = award.details || '';
        });
    }

    // Clear and reload volunteer work
    document.getElementById('volunteerList').innerHTML = '';
    if (formData.volunteer && formData.volunteer.length > 0) {
        formData.volunteer.forEach(item => {
            addVolunteer();
            const lastItem = document.getElementById('volunteerList').lastElementChild;
            lastItem.querySelector('.volunteer-role').value = item.role || '';
            lastItem.querySelector('.volunteer-org').value = item.org || '';
            lastItem.querySelector('.volunteer-start').value = item.start || '';
            lastItem.querySelector('.volunteer-end').value = item.end || '';
            lastItem.querySelector('.volunteer-description').value = item.description || '';
        });
    }

    // Clear and reload conferences
    document.getElementById('conferencesList').innerHTML = '';
    if (formData.conferences && formData.conferences.length > 0) {
        formData.conferences.forEach(item => {
            addConference();
            const lastItem = document.getElementById('conferencesList').lastElementChild;
            lastItem.querySelector('.conference-name').value = item.name || '';
            lastItem.querySelector('.conference-year').value = item.year || '';
            lastItem.querySelector('.conference-location').value = item.location || '';
            lastItem.querySelector('.conference-notes').value = item.notes || '';
        });
    }
}

// Load sample CV (Abhay Yadav)
async function loadSampleCV() {
    try {
        const response = await fetch('../static/sample-cv-data.json');
        const formData = await response.json();
        
        loadFormData(formData);
        showToast('Sample CV loaded successfully!', 'success');
    } catch (error) {
        console.error('Error loading sample CV:', error);
        showToast('Could not load sample CV. Check that the sample JSON exists.', 'error');
    }
}

// Download sample JSON template
function downloadSampleJSON() {
    const sampleData = {
        fullName: "",
        title: "",
        email: "",
        phone: "",
        location: "",
        summary: "",
        objective: "",
        skills: "",
        languages: "",
        hobbies: "",
        declaration: "",
        declarationDate: "",
        includeDeclaration: true,
        education: [
            {
                degree: "",
                institution: "",
                year: "",
                details: ""
            }
        ],
        experience: [
            {
                title: "",
                company: "",
                start: "",
                end: "",
                location: "",
                description: ""
            }
        ],
        projects: [
            {
                title: "",
                role: "",
                date: "",
                link: "",
                description: ""
            }
        ],
        achievements: [
            {
                title: "",
                date: "",
                details: ""
            }
        ],
        certifications: [
            {
                name: "",
                org: "",
                date: ""
            }
        ],
        awards: [
            {
                title: "",
                issuer: "",
                date: "",
                details: ""
            }
        ],
        volunteer: [
            {
                role: "",
                org: "",
                start: "",
                end: "",
                description: ""
            }
        ],
        conferences: [
            {
                name: "",
                year: "",
                location: "",
                notes: ""
            }
        ]
    };
    
    const dataStr = JSON.stringify(sampleData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cv-template.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Upload and load JSON file
function uploadJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.json')) {
        showToast('Please upload a JSON file.', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const formData = JSON.parse(e.target.result);
            loadFormData(formData);
            showToast('JSON file loaded successfully!', 'success');
        } catch (error) {
            console.error('Error parsing JSON:', error);
            showToast('Invalid JSON file. Please check the format.', 'error');
        }
    };
    reader.readAsText(file);
}

// Load form data from JSON object
function loadFormData(formData) {
    // Load personal info
    document.getElementById('fullName').value = formData.fullName || '';
    document.getElementById('title').value = formData.title || '';
    document.getElementById('email').value = formData.email || '';
    document.getElementById('phone').value = formData.phone || '';
    document.getElementById('location').value = formData.location || '';
    document.getElementById('summary').value = formData.summary || '';
    document.getElementById('objective').value = formData.objective || '';
    document.getElementById('skills').value = formData.skills || '';
    document.getElementById('languages').value = formData.languages || '';
    document.getElementById('hobbies').value = formData.hobbies || '';
    document.getElementById('declaration').value = formData.declaration || '';
    document.getElementById('declarationDate').value = formData.declarationDate || '';
    document.getElementById('includeDeclaration').checked = formData.includeDeclaration !== false;

    // Clear and reload education
    document.getElementById('educationList').innerHTML = '';
    if (formData.education && formData.education.length > 0) {
        formData.education.forEach(edu => {
            addEducation();
            const lastItem = document.getElementById('educationList').lastElementChild;
            lastItem.querySelector('.education-degree').value = edu.degree || '';
            lastItem.querySelector('.education-institution').value = edu.institution || '';
            lastItem.querySelector('.education-year').value = edu.year || '';
            lastItem.querySelector('.education-details').value = edu.details || '';
        });
    }

    // Clear and reload experience
    document.getElementById('experienceList').innerHTML = '';
    if (formData.experience && formData.experience.length > 0) {
        formData.experience.forEach(exp => {
            addExperience();
            const lastItem = document.getElementById('experienceList').lastElementChild;
            lastItem.querySelector('.experience-title').value = exp.title || '';
            lastItem.querySelector('.experience-company').value = exp.company || '';
            lastItem.querySelector('.experience-start').value = exp.start || '';
            lastItem.querySelector('.experience-end').value = exp.end || '';
            lastItem.querySelector('.experience-location').value = exp.location || '';
            lastItem.querySelector('.experience-description').value = exp.description || '';
        });
    }

    // Clear and reload projects
    document.getElementById('projectsList').innerHTML = '';
    if (formData.projects && formData.projects.length > 0) {
        formData.projects.forEach(project => {
            addProject();
            const lastItem = document.getElementById('projectsList').lastElementChild;
            lastItem.querySelector('.project-title').value = project.title || '';
            lastItem.querySelector('.project-role').value = project.role || '';
            lastItem.querySelector('.project-date').value = project.date || '';
            lastItem.querySelector('.project-link').value = project.link || '';
            lastItem.querySelector('.project-description').value = project.description || '';
        });
    }

    // Clear and reload achievements
    document.getElementById('achievementsList').innerHTML = '';
    if (formData.achievements && formData.achievements.length > 0) {
        formData.achievements.forEach(achievement => {
            addAchievement();
            const lastItem = document.getElementById('achievementsList').lastElementChild;
            lastItem.querySelector('.achievement-title').value = achievement.title || '';
            lastItem.querySelector('.achievement-date').value = achievement.date || '';
            lastItem.querySelector('.achievement-details').value = achievement.details || '';
        });
    }

    // Clear and reload certifications
    document.getElementById('certificationsList').innerHTML = '';
    if (formData.certifications && formData.certifications.length > 0) {
        formData.certifications.forEach(cert => {
            addCertification();
            const lastItem = document.getElementById('certificationsList').lastElementChild;
            lastItem.querySelector('.certification-name').value = cert.name || '';
            lastItem.querySelector('.certification-org').value = cert.org || '';
            lastItem.querySelector('.certification-date').value = cert.date || '';
        });
    }

    // Clear and reload awards
    document.getElementById('awardsList').innerHTML = '';
    if (formData.awards && formData.awards.length > 0) {
        formData.awards.forEach(award => {
            addAward();
            const lastItem = document.getElementById('awardsList').lastElementChild;
            lastItem.querySelector('.award-title').value = award.title || '';
            lastItem.querySelector('.award-issuer').value = award.issuer || '';
            lastItem.querySelector('.award-date').value = award.date || '';
            lastItem.querySelector('.award-details').value = award.details || '';
        });
    }

    // Clear and reload volunteer work
    document.getElementById('volunteerList').innerHTML = '';
    if (formData.volunteer && formData.volunteer.length > 0) {
        formData.volunteer.forEach(item => {
            addVolunteer();
            const lastItem = document.getElementById('volunteerList').lastElementChild;
            lastItem.querySelector('.volunteer-role').value = item.role || '';
            lastItem.querySelector('.volunteer-org').value = item.org || '';
            lastItem.querySelector('.volunteer-start').value = item.start || '';
            lastItem.querySelector('.volunteer-end').value = item.end || '';
            lastItem.querySelector('.volunteer-description').value = item.description || '';
        });
    }

    // Clear and reload conferences
    document.getElementById('conferencesList').innerHTML = '';
    if (formData.conferences && formData.conferences.length > 0) {
        formData.conferences.forEach(item => {
            addConference();
            const lastItem = document.getElementById('conferencesList').lastElementChild;
            lastItem.querySelector('.conference-name').value = item.name || '';
            lastItem.querySelector('.conference-year').value = item.year || '';
            lastItem.querySelector('.conference-location').value = item.location || '';
            lastItem.querySelector('.conference-notes').value = item.notes || '';
        });
    }

    // Update preview
    updatePreview();
    
    // Scroll to top
    window.scrollTo(0, 0);
}
