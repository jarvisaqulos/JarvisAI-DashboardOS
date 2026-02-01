/**
 * Jarvis Aqulos Dashboard - Operating System
 * Dark Mode Dashboard for Strategic Operations
 */

class JarvisDashboard {
    constructor() {
        this.status = 'idle';
        this.activeTask = null;
        this.lastAction = 'System initialized';
        this.lastActionTime = new Date();
        this.tasks = [];
        this.projects = [];
        this.resources = [];
        this.workLog = [];
        this.emails = [];
        this.lastEmailCheck = null;
        this.events = [];
        this.lastCalendarCheck = null;
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.startClock();
        this.startEmailHeartbeat(); // Start email checking
        this.startCalendarHeartbeat(); // Start calendar checking
        
        // Initialize with default tasks if empty
        if (this.tasks.length === 0) {
            this.initializeDefaultTasks();
        }
        
        this.renderAll();
        this.addLogEntry('Dashboard initialized', 'system');
        
        // Initial status
        this.setStatus('idle');
        
        console.log('🤖 Jarvis Aqulos Dashboard initialized');
    }

    // Initialize default tasks for Jarvis
    initializeDefaultTasks() {
        const defaultTasks = [
            {
                id: 'task-001',
                name: 'Build Jarvis Dashboard v2.0',
                description: 'Create comprehensive dashboard with Task Engine, Decision Log, Delegation Tracker, PH Ventures, Weekly Review modules',
                priority: 'high',
                status: 'active',
                project: '',
                assignee: 'jarvis',
                assignedBy: 'kris',
                created: new Date(Date.now() - 2 * 86400000).toISOString(),
                completed: null
            },
            {
                id: 'task-002',
                name: 'Set up X (Twitter) monitoring system',
                description: 'Create watchlist, follow key accounts, set up daily cron job for trend monitoring',
                priority: 'high',
                status: 'completed',
                project: '',
                assignee: 'jarvis',
                assignedBy: 'kris',
                created: new Date(Date.now() - 1 * 86400000).toISOString(),
                completed: new Date().toISOString()
            },
            {
                id: 'task-003',
                name: 'Update X profile @JAqulos67857',
                description: 'Update bio with entrepreneurship focus, follow 60+ accounts, set up daily monitoring',
                priority: 'high',
                status: 'completed',
                project: '',
                assignee: 'jarvis',
                assignedBy: 'kris',
                created: new Date(Date.now() - 1 * 86400000).toISOString(),
                completed: new Date().toISOString()
            },
            {
                id: 'task-004',
                name: 'Generate daily X trend briefs',
                description: 'Monitor followed accounts, extract key insights, generate 3-5 point briefs for restaurant marketing, AI, entrepreneurship trends',
                priority: 'medium',
                status: 'pending',
                project: '',
                assignee: 'jarvis',
                assignedBy: 'kris',
                created: new Date().toISOString(),
                completed: null
            },
            {
                id: 'task-005',
                name: 'Heartbeat monitoring (email, calendar, tasks)',
                description: 'Check emails every 30min, calendar every hour, task status updates, proactive alerts for urgent items',
                priority: 'medium',
                status: 'active',
                project: '',
                assignee: 'jarvis',
                assignedBy: 'kris',
                created: new Date(Date.now() - 2 * 86400000).toISOString(),
                completed: null
            },
            {
                id: 'task-006',
                name: 'Weekly dashboard review generation',
                description: 'Auto-compile weekly summary every Friday: wins, project progress, blockers, next week priorities',
                priority: 'medium',
                status: 'pending',
                project: '',
                assignee: 'jarvis',
                assignedBy: 'kris',
                created: new Date().toISOString(),
                completed: null
            },
            {
                id: 'task-007',
                name: 'PH Ventures check-ins',
                description: 'Weekly async check-ins with Philippines team: dorm operations, farm progress, F&B updates',
                priority: 'medium',
                status: 'pending',
                project: 'ph-ventures',
                assignee: 'jarvis',
                assignedBy: 'kris',
                created: new Date().toISOString(),
                completed: null
            },
            {
                id: 'task-008',
                name: 'Decision logging and tracking',
                description: 'Log all strategic decisions with context, alternatives considered, and review dates',
                priority: 'low',
                status: 'active',
                project: '',
                assignee: 'jarvis',
                assignedBy: 'kris',
                created: new Date().toISOString(),
                completed: null
            }
        ];
        
        this.tasks = defaultTasks;
        this.saveData();
        this.addLogEntry('Initialized with ' + defaultTasks.length + ' default tasks', 'system');
    }

    // Show/hide working indicator
    setWorking(isWorking) {
        const logo = document.getElementById('jarvisLogo');
        const indicator = document.getElementById('workingIndicator');
        
        if (logo) {
            if (isWorking) {
                logo.classList.add('working');
            } else {
                logo.classList.remove('working');
            }
        }
        
        if (indicator) {
            indicator.style.display = isWorking ? 'flex' : 'none';
        }
    }

    // Email Heartbeat - Check every 30 minutes
    startEmailHeartbeat() {
        // Check immediately on load
        this.checkEmail();
        
        // Then every 30 minutes (1800000 ms)
        setInterval(() => {
            this.checkEmail();
        }, 1800000);
        
        // Also update the UI every minute to show time since last check
        setInterval(() => {
            this.updateEmailStatus();
        }, 60000);
    }

    // Calendar Heartbeat - Check every hour
    startCalendarHeartbeat() {
        // Check immediately on load
        this.checkCalendar();
        
        // Then every hour (3600000 ms)
        setInterval(() => {
            this.checkCalendar();
        }, 3600000);
        
        // Update UI every minute
        setInterval(() => {
            this.updateCalendarStatus();
        }, 60000);
    }

    async checkCalendar() {
        this.addLogEntry('Checking calendar...', 'system');
        
        // In production, this would call the gog calendar API
        // For now, simulate with sample data or empty
        this.events = []; // Empty for now - will populate from API
        this.lastCalendarCheck = new Date();
        
        // Check for upcoming meetings in next 2 hours
        const upcoming = this.getUpcomingEvents(2);
        if (upcoming.length > 0) {
            this.addLogEntry(`${upcoming.length} upcoming meeting(s)`, 'calendar');
        }
        
        this.renderCalendar();
        this.saveData();
    }

    getUpcomingEvents(hoursAhead) {
        const now = new Date();
        const future = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
        return this.events.filter(e => {
            const eventTime = new Date(e.start);
            return eventTime > now && eventTime < future;
        });
    }

    updateCalendarStatus() {
        const statusEl = document.getElementById('calendarCheckStatus');
        if (statusEl && this.lastCalendarCheck) {
            const mins = Math.floor((new Date() - this.lastCalendarCheck) / 60000);
            statusEl.textContent = `Last check: ${mins}m ago`;
        }
        
        // Show next meeting
        const nextMeetingEl = document.getElementById('nextMeeting');
        if (nextMeetingEl) {
            const upcoming = this.getUpcomingEvents(24);
            if (upcoming.length > 0) {
                const next = upcoming[0];
                nextMeetingEl.textContent = next.title;
                document.getElementById('nextMeetingTime').textContent = this.formatTime(next.start);
            } else {
                nextMeetingEl.textContent = 'No upcoming meetings';
                document.getElementById('nextMeetingTime').textContent = '—';
            }
        }
    }

    renderCalendar() {
        const container = document.getElementById('calendarList');
        if (!container) return;
        
        if (this.events.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div>📅 Calendar connected</div>
                    <div style="font-size: 12px; margin-top: 8px; color: var(--text-tertiary);">No upcoming events</div>
                </div>
            `;
            return;
        }
        
        // Sort by date
        const sorted = [...this.events].sort((a, b) => new Date(a.start) - new Date(b.start));
        
        container.innerHTML = sorted.slice(0, 5).map(event => `
            <div class="calendar-item">
                <div class="calendar-date">
                    <span class="day">${new Date(event.start).getDate()}</span>
                    <span class="month">${new Date(event.start).toLocaleDateString('en-US', { month: 'short' })}</span>
                </div>
                <div class="calendar-info">
                    <div class="calendar-title">${event.title}</div>
                    <div class="calendar-time">${this.formatTime(event.start)} - ${this.formatTime(event.end)}</div>
                    ${event.location ? `<div class="calendar-location">📍 ${event.location}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    async checkEmail() {
        this.addLogEntry('Checking email...', 'system');
        
        // In a real implementation, this would call an API endpoint
        // that runs: GOG_KEYRING_PASSWORD=openclaw gog gmail messages search "in:inbox is:unread" --max 20
        
        // For now, simulate with sample data or load from localStorage
        const mockEmails = [
            {
                id: '19c150fe7d16b9ac',
                from: 'GitHub',
                subject: '[GitHub] A new SSH authentication public key was added',
                time: new Date().toISOString(),
                unread: true,
                category: 'updates',
                priority: 'medium'
            },
            {
                id: '19c1313767452207',
                from: 'OpenRouter Team',
                subject: 'Uptime optimization at no extra cost',
                time: new Date(Date.now() - 3600000).toISOString(),
                unread: true,
                category: 'promotions',
                priority: 'low'
            }
        ];
        
        this.emails = mockEmails;
        this.lastEmailCheck = new Date();
        
        const unreadCount = this.emails.filter(e => e.unread).length;
        if (unreadCount > 0) {
            this.addLogEntry(`${unreadCount} unread email(s) found`, 'email');
            // Could trigger notification here
        }
        
        this.renderEmails();
        this.saveData();
    }

    updateEmailStatus() {
        const statusEl = document.getElementById('emailCheckStatus');
        if (statusEl && this.lastEmailCheck) {
            const mins = Math.floor((new Date() - this.lastEmailCheck) / 60000);
            statusEl.textContent = `Last check: ${mins}m ago`;
        }
    }

    renderEmails() {
        const container = document.getElementById('emailList');
        if (!container) return;
        
        const unread = this.emails.filter(e => e.unread);
        
        if (this.emails.length === 0) {
            container.innerHTML = '<div class="empty-state">No unread emails</div>';
            return;
        }
        
        container.innerHTML = this.emails.map(email => `
            <div class="email-item ${email.unread ? 'unread' : ''}" data-id="${email.id}">
                <div class="email-sender">${email.from}</div>
                <div class="email-subject">${email.subject}</div>
                <div class="email-meta">
                    <span class="email-time">${this.formatTime(email.time)}</span>
                    ${email.unread ? '<span class="unread-badge">NEW</span>' : ''}
                </div>
            </div>
        `).join('');
        
        // Update badges
        const badge = document.getElementById('emailBadge');
        const navBadge = document.getElementById('navEmailBadge');
        if (badge) {
            badge.textContent = unread.length;
            badge.style.display = unread.length > 0 ? 'inline-block' : 'none';
        }
        if (navBadge) {
            navBadge.textContent = unread.length;
            navBadge.style.display = unread.length > 0 ? 'inline-block' : 'none';
        }
    }

    // Data Management
    loadData() {
        const saved = localStorage.getItem('jarvisDashboard');
        if (saved) {
            const data = JSON.parse(saved);
            this.tasks = data.tasks || [];
            this.projects = data.projects || [];
            this.resources = data.resources || [];
            this.workLog = data.workLog || [];
            this.emails = data.emails || [];
            this.lastEmailCheck = data.lastEmailCheck ? new Date(data.lastEmailCheck) : null;
            this.events = data.events || [];
            this.lastCalendarCheck = data.lastCalendarCheck ? new Date(data.lastCalendarCheck) : null;
        }
        
        // Load initial projects if none exist
        if (this.projects.length === 0) {
            this.initializeDefaultProjects();
        }
    }

    saveData() {
        const data = {
            tasks: this.tasks,
            projects: this.projects,
            resources: this.resources,
            workLog: this.workLog,
            emails: this.emails,
            lastEmailCheck: this.lastEmailCheck,
            events: this.events,
            lastCalendarCheck: this.lastCalendarCheck
        };
        localStorage.setItem('jarvisDashboard', JSON.stringify(data));
    }

    initializeDefaultProjects() {
        this.projects = [
            {
                id: 'thinknlocal',
                name: 'ThinkNLocal',
                description: 'Scale to 1,000 local partners at $150-200/mo',
                status: 'active',
                icon: '🏪',
                tasks: 0,
                deliverables: [],
                files: [],
                tools: ['GoHighLevel', 'Zapier', 'Slack'],
                links: [
                    { name: 'GitHub', url: 'https://github.com/jarvisaqulos/Jarvis-Workspace' }
                ],
                created: new Date().toISOString()
            },
            {
                id: 'aqulos',
                name: 'AQULOS Rebuild',
                description: 'AI + automation-powered growth agency',
                status: 'active',
                icon: '🚀',
                tasks: 0,
                deliverables: [],
                files: [],
                tools: ['OpenAI', 'Make', 'n8n'],
                links: [],
                created: new Date().toISOString()
            },
            {
                id: 'ph-ventures',
                name: 'Philippine Ventures',
                description: 'Dorm, farm, F&B operational success',
                status: 'active',
                icon: '🏝️',
                tasks: 0,
                deliverables: [],
                files: [],
                tools: ['Google Sheets', 'WhatsApp'],
                links: [],
                created: new Date().toISOString()
            }
        ];
        this.saveData();
    }

    // Status Management
    setStatus(status) {
        const validStatuses = ['active', 'idle', 'planning', 'blocked'];
        if (!validStatuses.includes(status)) return;
        
        this.status = status;
        this.updateStatusUI();
        this.addLogEntry(`Status changed to ${status.toUpperCase()}`, 'status');
        
        // Save to localStorage for persistence
        localStorage.setItem('jarvisStatus', status);
        
        // Update working indicator based on status
        this.setWorking(status === 'active');
    }

    updateStatusUI() {
        const indicator = document.getElementById('statusIndicator');
        const text = document.getElementById('statusText');
        const currentState = document.getElementById('currentState');
        const currentStateCard = document.getElementById('currentStateCard');
        
        const statusConfig = {
            active: { 
                text: 'ACTIVE', 
                class: 'active',
                sublabel: 'Working on tasks'
            },
            idle: { 
                text: 'IDLE', 
                class: 'idle',
                sublabel: 'Ready for work'
            },
            planning: { 
                text: 'PLANNING', 
                class: 'planning',
                sublabel: 'Strategic review'
            },
            blocked: { 
                text: 'BLOCKED', 
                class: 'blocked',
                sublabel: 'Needs input'
            }
        };
        
        const config = statusConfig[this.status];
        
        indicator.className = 'status-indicator ' + config.class;
        text.textContent = config.text;
        currentState.textContent = config.text;
        
        // Update sublabel
        const sublabel = currentStateCard.querySelector('.status-sublabel');
        if (sublabel) sublabel.textContent = config.sublabel;
        
        // Update logo pulse
        const logoIcon = document.querySelector('.logo-icon');
        if (this.status === 'active') {
            logoIcon.style.animation = 'pulse 1s infinite';
        } else {
            logoIcon.style.animation = 'pulse 2s infinite';
        }
    }

    // Clock
    startClock() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    updateClock() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('timestamp').textContent = timeStr;
        
        // Update last action relative time
        this.updateLastActionTime();
    }

    updateLastActionTime() {
        const el = document.getElementById('lastActionTime');
        if (el && this.lastActionTime) {
            const diff = Math.floor((new Date() - this.lastActionTime) / 1000);
            let text;
            if (diff < 60) text = 'Just now';
            else if (diff < 3600) text = `${Math.floor(diff / 60)}m ago`;
            else if (diff < 86400) text = `${Math.floor(diff / 3600)}h ago`;
            else text = `${Math.floor(diff / 86400)}d ago`;
            el.textContent = text;
        }
    }

    // Task Management - These are tasks FOR JARVIS (assigned by Kris)
    addTask() {
        this.openModal('taskModal');
        this.populateProjectSelect();
    }

    saveTask() {
        const name = document.getElementById('taskName').value;
        const desc = document.getElementById('taskDesc').value;
        const priority = document.getElementById('taskPriority').value;
        const status = document.getElementById('taskStatus').value;
        const project = document.getElementById('taskProject').value;
        const eta = document.getElementById('taskETA').value;
        
        if (!name) {
            alert('Task name is required');
            return;
        }
        
        // Task assigned TO JARVIS by Kris
        const task = {
            id: Date.now().toString(),
            name,
            description: desc,
            priority,
            status,
            project,
            eta,
            assignee: 'jarvis',  // Task is for Jarvis
            assignedBy: 'kris',  // Assigned by Kris
            created: new Date().toISOString(),
            completed: status === 'completed' ? new Date().toISOString() : null
        };
        
        this.tasks.push(task);
        this.saveData();
        this.renderTasks();
        this.closeModal();
        this.addLogEntry(`Task assigned to Jarvis: ${name}`, 'task');
        
        // Clear form
        document.getElementById('taskName').value = '';
        document.getElementById('taskDesc').value = '';
    }

    updateTaskStatus(taskId, newStatus) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            if (newStatus === 'completed') {
                task.completed = new Date().toISOString();
            }
            this.saveData();
            this.renderTasks();
            this.addLogEntry(`Task ${newStatus}: ${task.name}`, 'task');
        }
    }

    deleteTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (confirm('Delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveData();
            this.renderTasks();
            this.addLogEntry(`Task deleted: ${task.name}`, 'task');
        }
    }

    populateProjectSelect() {
        const select = document.getElementById('taskProject');
        select.innerHTML = '<option value="">No Project</option>';
        this.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            select.appendChild(option);
        });
    }

    // Project Management
    addProject() {
        const name = prompt('Project name:');
        if (name) {
            const project = {
                id: Date.now().toString(),
                name,
                description: '',
                status: 'active',
                icon: '📁',
                tasks: 0,
                deliverables: [],
                files: [],
                tools: [],
                links: [],
                created: new Date().toISOString()
            };
            this.projects.push(project);
            this.saveData();
            this.renderProjects();
            this.addLogEntry(`Project created: ${name}`, 'project');
        }
    }

    // Resource Management
    addResource() {
        const title = prompt('Resource title:');
        const url = prompt('Resource URL:');
        if (title && url) {
            const resource = {
                id: Date.now().toString(),
                title,
                url,
                status: 'to-review',
                tags: [],
                created: new Date().toISOString()
            };
            this.resources.push(resource);
            this.saveData();
            this.renderResources();
            this.addLogEntry(`Resource added: ${title}`, 'resource');
        }
    }

    // Work Log
    addLogEntry(text, type = 'general') {
        const entry = {
            id: Date.now().toString(),
            text,
            type,
            timestamp: new Date().toISOString()
        };
        this.workLog.unshift(entry);
        
        // Keep only last 100 entries
        if (this.workLog.length > 100) {
            this.workLog = this.workLog.slice(0, 100);
        }
        
        this.saveData();
        this.renderWorkLog();
        
        // Update last action
        this.lastAction = text;
        this.lastActionTime = new Date();
        document.getElementById('lastAction').textContent = text;
    }

    // Rendering
    renderAll() {
        this.renderTasks();
        this.renderProjects();
        this.renderResources();
        this.renderWorkLog();
        this.renderEmails();
        this.renderCalendar();
        this.renderStats();
        this.updateStatusUI();
        this.updateEmailStatus();
        this.updateCalendarStatus();
    }

    renderTasks() {
        const activeList = document.getElementById('activeTasksList');
        const activeFull = document.getElementById('activeTasksFull');
        const pendingFull = document.getElementById('pendingTasksFull');
        const completedFull = document.getElementById('completedTasksFull');
        
        const active = this.tasks.filter(t => t.status === 'active');
        const pending = this.tasks.filter(t => t.status === 'pending');
        const completed = this.tasks.filter(t => t.status === 'completed');
        
        // Update counts
        document.getElementById('taskBadge').textContent = active.length;
        document.getElementById('activeCount').textContent = active.length;
        document.getElementById('pendingCount').textContent = pending.length;
        document.getElementById('completedCount').textContent = completed.length;
        
        // Update active task display
        if (active.length > 0) {
            document.getElementById('activeTask').textContent = active[0].name;
            document.getElementById('taskProgress').textContent = `${active.length} active task${active.length > 1 ? 's' : ''}`;
        } else {
            document.getElementById('activeTask').textContent = 'None';
            document.getElementById('taskProgress').textContent = '--';
        }
        
        // Render lists
        activeList.innerHTML = active.length ? active.map(t => this.renderTaskItem(t)).join('') : '<div class="empty-state">Jarvis is ready - assign a task to get started</div>';
        activeFull.innerHTML = active.length ? active.map(t => this.renderTaskDetailed(t)).join('') : '<div class="empty-state">No active tasks - Jarvis is ready for assignment</div>';
        pendingFull.innerHTML = pending.length ? pending.map(t => this.renderTaskDetailed(t)).join('') : '<div class="empty-state">No queued tasks</div>';
        completedFull.innerHTML = completed.length ? completed.slice(0, 10).map(t => this.renderTaskDetailed(t)).join('') : '<div class="empty-state">No completed tasks yet</div>';
    }

    renderTaskItem(task) {
        const project = this.projects.find(p => p.id === task.project);
        return `
            <div class="task-item" onclick="dashboard.viewTask('${task.id}')">
                <div class="task-priority ${task.priority}"></div>
                <div class="task-info">
                    <div class="task-name">${task.name}</div>
                    <div class="task-meta">${project ? project.name : 'No project'} • ${this.formatDate(task.created)}</div>
                </div>
                <span class="task-status ${task.status}">${task.status}</span>
            </div>
        `;
    }

    renderTaskDetailed(task) {
        const project = this.projects.find(p => p.id === task.project);
        return `
            <div class="task-item">
                <div class="task-priority ${task.priority}"></div>
                <div class="task-info">
                    <div class="task-name">🤖 ${task.name}</div>
                    <div class="task-meta">${task.description || 'No description'} • ${project ? project.name : 'No project'}</div>
                </div>
                <div class="task-actions">
                    ${task.status !== 'active' ? `<button class="btn-small" onclick="dashboard.updateTaskStatus('${task.id}', 'active')">Start</button>` : ''}
                    ${task.status !== 'completed' ? `<button class="btn-small" onclick="dashboard.updateTaskStatus('${task.id}', 'completed')">Complete</button>` : ''}
                    <button class="btn-small" onclick="dashboard.deleteTask('${task.id}')">Delete</button>
                </div>
            </div>
        `;
    }

    renderProjects() {
        const container = document.getElementById('projectsGrid');
        const recentList = document.getElementById('recentProjectsList');
        
        if (this.projects.length === 0) {
            container.innerHTML = '<div class="empty-state large">No projects yet. Create your first project to start tracking.</div>';
            recentList.innerHTML = '<div class="empty-state">No projects yet</div>';
            return;
        }
        
        container.innerHTML = this.projects.map(p => `
            <div class="project-card">
                <div class="project-header">
                    <div class="project-icon">${p.icon}</div>
                    <div class="project-info">
                        <h3>${p.name}</h3>
                        <p>${p.description || 'No description'}</p>
                    </div>
                </div>
                <div class="project-stats">
                    <span class="stat">Tasks: ${p.tasks}</span>
                    <span class="stat">Files: ${p.files.length}</span>
                    <span class="stat">Links: ${p.links.length}</span>
                </div>
                <div class="project-links">
                    ${p.links.map(l => `<a href="${l.url}" target="_blank">${l.name}</a>`).join(' • ')}
                </div>
            </div>
        `).join('');
        
        recentList.innerHTML = this.projects.slice(0, 3).map(p => `
            <div class="task-item" style="cursor: default;">
                <div class="task-info">
                    <div class="task-name">${p.icon} ${p.name}</div>
                    <div class="task-meta">${p.description || 'No description'}</div>
                </div>
                <span class="task-status ${p.status}">${p.status}</span>
            </div>
        `).join('');
    }

    renderResources() {
        const container = document.getElementById('resourcesList');
        
        if (this.resources.length === 0) {
            container.innerHTML = '<div class="empty-state">No resources saved yet</div>';
            return;
        }
        
        container.innerHTML = this.resources.map(r => `
            <div class="resource-item">
                <div class="resource-status ${r.status}"></div>
                <div class="resource-content">
                    <div class="resource-title">${r.title}</div>
                    <a href="${r.url}" target="_blank" class="resource-url">${r.url}</a>
                    <div class="resource-meta">
                        ${r.tags.map(t => `<span class="resource-tag">${t}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderWorkLog() {
        const container = document.getElementById('workLog');
        
        if (this.workLog.length === 0) {
            container.innerHTML = '<div class="empty-state">No activity yet</div>';
            return;
        }
        
        container.innerHTML = this.workLog.slice(0, 50).map(entry => {
            const time = new Date(entry.timestamp).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            return `
                <div class="log-entry">
                    <span class="log-time">${time}</span>
                    <span class="log-icon">◉</span>
                    <span class="log-text">${entry.text}</span>
                    <span class="log-tag">${entry.type}</span>
                </div>
            `;
        }).join('');
    }

    renderStats() {
        const completed = this.tasks.filter(t => t.status === 'completed').length;
        const active = this.projects.filter(p => p.status === 'active').length;
        
        document.getElementById('statTasksCompleted').textContent = completed;
        document.getElementById('statProjectsActive').textContent = active;
        document.getElementById('statResources').textContent = this.resources.length;
        document.getElementById('statWorkLog').textContent = this.workLog.length;
    }

    // Utility
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    formatTime(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // Navigation
    switchSection(sectionId) {
        // Update nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === sectionId) {
                item.classList.add('active');
            }
        });
        
        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
    }

    // Modal Management
    openModal(modalId) {
        document.getElementById('modalOverlay').classList.add('active');
        document.getElementById(modalId).classList.add('active');
    }

    closeModal() {
        document.querySelectorAll('.modal-overlay, .modal').forEach(el => {
            el.classList.remove('active');
        });
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                this.switchSection(item.dataset.section);
            });
        });
        
        // Modal overlay click
        document.getElementById('modalOverlay').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    // View Task Detail
    viewTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            alert(`🤖 Task Assigned to Jarvis\n\nName: ${task.name}\nDescription: ${task.description || 'None'}\nPriority: ${task.priority}\nStatus: ${task.status}\nAssigned by: ${task.assignedBy || 'Kris'}\nCreated: ${this.formatDate(task.created)}`);
        }
    }

    // ========== DECISION LOG MODULE ==========
    
    renderDecisions() {
        const container = document.getElementById('decisionsList');
        if (!container) return;
        
        if (!this.decisions || this.decisions.length === 0) {
            container.innerHTML = '<div class="empty-state">No decisions logged yet</div>';
            return;
        }
        
        container.innerHTML = this.decisions.map(d => `
            <div class="decision-card ${d.reversible ? 'reversible' : 'final'}">
                <div class="decision-header">
                    <span class="decision-date">${this.formatDate(d.timestamp)}</span>
                    <span class="decision-badge ${d.reversible ? 'reversible' : 'final'}">${d.reversible ? 'Reversible' : 'Final'}</span>
                </div>
                <div class="decision-title">${d.decision}</div>
                <div class="decision-context">${d.context}</div>
                <div class="decision-why"><strong>Why:</strong> ${d.why}</div>
                ${d.alternatives ? `<div class="decision-alts"><strong>Alternatives:</strong> ${d.alternatives.join(', ')}</div>` : ''}
                ${d.outcome ? `<div class="decision-outcome"><strong>Outcome:</strong> ${d.outcome}</div>` : ''}
                ${d.reviewDate ? `<div class="decision-review">Review: ${d.reviewDate}</div>` : ''}
            </div>
        `).join('');
    }

    addDecision() {
        const decision = prompt('Decision made:');
        if (!decision) return;
        
        const context = prompt('Context (why this decision was needed):');
        const why = prompt('Why this path (reasoning):');
        const reversible = confirm('Is this decision reversible?');
        
        if (!this.decisions) this.decisions = [];
        
        this.decisions.unshift({
            id: 'dec-' + Date.now(),
            decision,
            context: context || '',
            why: why || '',
            reversible,
            timestamp: new Date().toISOString(),
            madeBy: 'Kris',
            outcome: null
        });
        
        this.saveData();
        this.renderDecisions();
        this.addLogEntry('Decision logged: ' + decision, 'decision');
    }

    // ========== DELEGATION TRACKER MODULE ==========
    
    renderDelegations() {
        const container = document.getElementById('delegationsList');
        const badge = document.getElementById('delegationBadge');
        if (!container) return;
        
        if (!this.delegations || this.delegations.length === 0) {
            container.innerHTML = '<div class="empty-state">No active delegations</div>';
            if (badge) badge.style.display = 'none';
            return;
        }
        
        const activeCount = this.delegations.filter(d => d.status === 'active').length;
        if (badge) {
            badge.textContent = activeCount;
            badge.style.display = activeCount > 0 ? 'inline' : 'none';
        }
        
        container.innerHTML = this.delegations.map(d => {
            const isOverdue = new Date(d.escalationDate) < new Date();
            return `
            <div class="delegation-card ${d.status} ${isOverdue ? 'overdue' : ''}">
                <div class="delegation-header">
                    <span class="delegation-owner">${d.owner}</span>
                    <span class="delegation-status ${d.status}">${d.status}</span>
                </div>
                <div class="delegation-task">${d.task}</div>
                <div class="delegation-meta">
                    <span>Due: ${this.formatDate(d.dueDate)}</span>
                    <span>Check-in: ${d.checkInFrequency}</span>
                </div>
                ${isOverdue ? '<div class="escalation-warning">⚠️ Escalation overdue</div>' : ''}
                <div class="delegation-notes">${d.notes || ''}</div>
            </div>
        `}).join('');
    }

    addDelegation() {
        const task = prompt('Task to delegate:');
        if (!task) return;
        
        const owner = prompt('Owner (name):');
        const dueDate = prompt('Due date (YYYY-MM-DD):');
        const checkIn = prompt('Check-in frequency (daily/weekly):', 'weekly');
        
        if (!this.delegations) this.delegations = [];
        
        this.delegations.push({
            id: 'del-' + Date.now(),
            task,
            owner: owner || 'TBD',
            dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            checkInFrequency: checkIn || 'weekly',
            lastContact: new Date().toISOString(),
            status: 'active',
            escalationDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            notes: ''
        });
        
        this.saveData();
        this.renderDelegations();
        this.addLogEntry('Delegation created: ' + task + ' → ' + owner, 'delegation');
    }

    // ========== PH VENTURES MODULE ==========
    
    renderPHVentures() {
        const timeEl = document.getElementById('phTime');
        const container = document.getElementById('phBusinesses');
        const checkinsEl = document.getElementById('phCheckIns');
        
        if (timeEl) {
            const now = new Date();
            const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
            timeEl.textContent = phTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        
        if (!this.phVentures) {
            this.phVentures = {
                businesses: [],
                team: [],
                checkIns: []
            };
        }
        
        if (container) {
            if (!this.phVentures.businesses || this.phVentures.businesses.length === 0) {
                container.innerHTML = '<div class="empty-state">No PH ventures configured</div>';
            } else {
                container.innerHTML = this.phVentures.businesses.map(b => `
                    <div class="ph-business-card ${b.status}">
                        <div class="business-header">
                            <span class="business-name">${b.name}</span>
                            <span class="business-type">${b.type}</span>
                        </div>
                        <div class="business-status">Status: ${b.status}</div>
                        ${b.manager ? `<div class="business-manager">Manager: ${b.manager}</div>` : ''}
                        ${b.weeklyCheckIn ? `<div class="business-checkin">Last check-in: ${this.formatDate(b.weeklyCheckIn)}</div>` : ''}
                    </div>
                `).join('');
            }
        }
        
        if (checkinsEl) {
            if (!this.phVentures.checkIns || this.phVentures.checkIns.length === 0) {
                checkinsEl.innerHTML = '<div class="empty-state">No check-ins yet</div>';
            } else {
                checkinsEl.innerHTML = this.phVentures.checkIns.map(c => `
                    <div class="checkin-entry">
                        <span class="checkin-date">${this.formatDate(c.date)}</span>
                        <span class="checkin-business">${c.business}</span>
                        <span class="checkin-summary">${c.summary}</span>
                    </div>
                `).join('');
            }
        }
    }

    addPHCheckIn() {
        const business = prompt('Business name:');
        if (!business) return;
        
        const summary = prompt('Check-in summary:');
        
        if (!this.phVentures) this.phVentures = { businesses: [], team: [], checkIns: [] };
        if (!this.phVentures.checkIns) this.phVentures.checkIns = [];
        
        this.phVentures.checkIns.unshift({
            id: 'phc-' + Date.now(),
            business,
            summary: summary || '',
            date: new Date().toISOString(),
            hasPhotos: false
        });
        
        this.saveData();
        this.renderPHVentures();
        this.addLogEntry('PH Check-in: ' + business, 'ph-ventures');
    }

    // ========== WEEKLY REVIEW MODULE ==========
    
    renderWeeklyReviews() {
        const container = document.getElementById('weeklyReviewContent');
        const previousEl = document.getElementById('previousReviews');
        
        if (!this.weeklyReviews || this.weeklyReviews.length === 0) {
            if (container) container.innerHTML = '<div class="empty-state">Click Generate to create this week\'s review</div>';
            if (previousEl) previousEl.innerHTML = '<div class="empty-state">No previous reviews</div>';
            return;
        }
        
        const current = this.weeklyReviews[0];
        
        if (container && current) {
            container.innerHTML = `
                <div class="weekly-review-card">
                    <div class="review-header">
                        <span class="review-week">Week ${current.week}</span>
                        <span class="review-date">${current.startDate} - ${current.endDate}</span>
                    </div>
                    
                    <div class="review-section">
                        <h4>🏆 Wins</h4>
                        <ul>${current.wins.map(w => `<li>${w}</li>`).join('')}</ul>
                    </div>
                    
                    <div class="review-section">
                        <h4>📊 Project Progress</h4>
                        ${Object.entries(current.projectsProgress || {}).map(([p, status]) => `
                            <div class="project-status"><strong>${p}:</strong> ${status}</div>
                        `).join('')}
                    </div>
                    
                    ${current.blockers?.length ? `
                    <div class="review-section">
                        <h4>🚫 Blockers</h4>
                        <ul>${current.blockers.map(b => `<li>${b}</li>`).join('')}</ul>
                    </div>
                    ` : ''}
                    
                    <div class="review-section">
                        <h4>➡️ Next Week Priorities</h4>
                        <ol>${current.nextWeekPriorities.map(p => `<li>${p}</li>`).join('')}</ol>
                    </div>
                    
                    <div class="review-meta">
                        <span>Generated: ${this.formatDate(current.generatedAt)}</span>
                    </div>
                </div>
            `;
        }
        
        if (previousEl) {
            const previous = this.weeklyReviews.slice(1);
            previousEl.innerHTML = previous.map(r => `
                <div class="previous-review-item">
                    <span class="review-week">${r.week}</span>
                    <span class="review-wins">${r.wins?.length || 0} wins</span>
                    <span class="review-date">${r.startDate}</span>
                </div>
            `).join('');
        }
    }

    generateWeeklyReview() {
        const now = new Date();
        const weekStart = new Date(now.getTime() - now.getDay() * 86400000);
        const weekEnd = new Date(weekStart.getTime() + 6 * 86400000);
        
        const weekNum = this.getWeekNumber(now);
        const weekStr = `${now.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
        
        // Auto-collect data
        const completedTasks = this.tasks?.filter(t => t.status === 'completed' && t.completed) || [];
        const wins = completedTasks.slice(0, 5).map(t => t.title);
        
        const projectsProgress = {};
        this.projects?.forEach(p => {
            projectsProgress[p.name] = `${p.progress}% - ${p.status}`;
        });
        
        const activeDelegations = this.delegations?.filter(d => d.status === 'active') || [];
        
        if (!this.weeklyReviews) this.weeklyReviews = [];
        
        this.weeklyReviews.unshift({
            week: weekStr,
            startDate: weekStart.toISOString().split('T')[0],
            endDate: weekEnd.toISOString().split('T')[0],
            wins: wins.length ? wins : ['No major wins logged this week'],
            projectsProgress,
            blockers: [],
            nextWeekPriorities: [],
            delegationStatus: `${activeDelegations.length} active delegations`,
            calendarConflicts: null,
            generatedAt: now.toISOString()
        });
        
        this.saveData();
        this.renderWeeklyReviews();
        this.addLogEntry('Weekly review generated for ' + weekStr, 'review');
    }

    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    // ========== ENHANCED RENDER ALL ==========
    
    renderAll() {
        this.renderStatus();
        this.renderActiveTasks();
        this.renderTaskList();
        this.renderProjects();
        this.renderGoals();
        this.renderResources();
        this.renderWorkLog();
        // New modules
        this.renderDecisions();
        this.renderDelegations();
        this.renderPHVentures();
        this.renderWeeklyReviews();
    }

    // ========== ENHANCED LOAD/SAVE ==========
    
    loadData() {
        const saved = localStorage.getItem('jarvisDashboardData');
        if (saved) {
            const data = JSON.parse(saved);
            this.tasks = data.tasks || [];
            this.projects = data.projects || [];
            this.goals = data.goals || [];
            this.resources = data.resources || [];
            this.workLog = data.workLog || [];
            this.systemStatus = data.systemStatus || {};
            // New modules
            this.decisions = data.decisions || [];
            this.delegations = data.delegations || [];
            this.phVentures = data.phVentures || { businesses: [], team: [], checkIns: [] };
            this.weeklyReviews = data.weeklyReviews || [];
        }
    }

    saveData() {
        const data = {
            tasks: this.tasks,
            projects: this.projects,
            goals: this.goals,
            resources: this.resources,
            workLog: this.workLog,
            systemStatus: this.systemStatus,
            // New modules
            decisions: this.decisions || [],
            delegations: this.delegations || [],
            phVentures: this.phVentures || { businesses: [], team: [], checkIns: [] },
            weeklyReviews: this.weeklyReviews || []
        };
        localStorage.setItem('jarvisDashboardData', JSON.stringify(data));
        
        // Also save to server if available
        fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).catch(() => {});
    }
}

// Initialize dashboard
const dashboard = new JarvisDashboard();
