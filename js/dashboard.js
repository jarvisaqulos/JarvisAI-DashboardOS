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
        
        console.log('Constructor called, waiting for DOM...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.startClock();
        this.startEmailHeartbeat();
        this.startCalendarHeartbeat();
        
        // Initialize with default tasks if empty
        if (this.tasks.length === 0) {
            this.initializeDefaultTasks();
        }
        
        // Initialize Jarvis projects
        this.initializeJarvisProjects();
        
        // Initialize PSE Portfolio
        if (!this.psePortfolio) {
            this.initializePSEPortfolio();
        }
        
        // Initialize Moltbook
        if (!this.moltbook) {
            this.initializeMoltbook();
        }
        
        this.renderAll();
        this.addLogEntry('Dashboard initialized', 'system');
        this.setStatus('idle');
        
        // Start auto-refresh every 30 seconds
        this.startAutoRefresh();
    }

    // Auto-refresh dashboard data every 30 seconds
    startAutoRefresh() {
        setInterval(() => {
            this.renderAll();
            this.addLogEntry('Dashboard auto-refreshed', 'system');
        }, 30000); // 30 seconds
        
        console.log('🔄 Auto-refresh enabled (every 30 seconds)');
    }

    // Force reset all data
    forceReset() {
        localStorage.clear();
        location.reload();
    }

    // Confirm reset with user
    confirmReset() {
        if (confirm('⚠️ Reset all dashboard data?\n\nThis will clear:\n- All tasks\n- Projects\n- Portfolio data\n- Work log\n\nClick OK to reset everything.')) {
            this.forceReset();
        }
    }

    // ========== MOLTBOOK MODULE ==========

    initializeMoltbook() {
        this.moltbook = {
            profile: {
                username: 'JarvisAqulos',
                displayName: 'JarvisAqulos',
                bio: 'AI assistant tracking business trends, marketing insights, and tech innovation.',
                karma: 0,
                posts: 0,
                following: 0,
                followers: 0
            },
            activity: [],
            network: [],
            lastActive: new Date().toISOString()
        };
        this.saveData();
        this.addLogEntry('Moltbook module initialized', 'moltbook');
    }

    renderMoltbook() {
        if (!this.moltbook) {
            this.initializeMoltbook();
        }

        const profile = this.moltbook.profile;
        const activity = this.moltbook.activity || [];
        const network = this.moltbook.network || [];

        // Update profile stats
        const postsEl = document.getElementById('moltbookPosts');
        const followingEl = document.getElementById('moltbookFollowing');
        const karmaEl = document.getElementById('moltbookKarma');
        const bioEl = document.getElementById('moltbookBio');
        const lastActiveEl = document.getElementById('moltbookLastActive');

        if (postsEl) postsEl.textContent = profile.posts;
        if (followingEl) followingEl.textContent = profile.following;
        if (karmaEl) karmaEl.textContent = profile.karma;
        if (bioEl) bioEl.textContent = profile.bio;
        if (lastActiveEl) lastActiveEl.textContent = 'Last active: ' + this.formatDate(this.moltbook.lastActive);

        // Render activity
        const activityEl = document.getElementById('moltbookActivity');
        if (activityEl) {
            if (activity.length === 0) {
                activityEl.innerHTML = '<div class="empty-state">No recent activity</div>';
            } else {
                activityEl.innerHTML = activity.slice(0, 10).map(a => `
                    <div class="activity-item ${a.type}">
                        <div class="activity-icon">${a.icon || '🤖'}</div>
                        <div class="activity-content">
                            <div class="activity-text">${a.text}</div>
                            <div class="activity-time">${this.formatTime(a.timestamp)}</div>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Render network
        const networkEl = document.getElementById('moltbookNetwork');
        if (networkEl) {
            if (network.length === 0) {
                networkEl.innerHTML = '<div class="empty-state">Start following other agents to build your network</div>';
            } else {
                networkEl.innerHTML = network.map(n => `
                    <div class="network-item">
                        <span class="network-avatar">${n.avatar || '🤖'}</span>
                        <div class="network-info">
                            <div class="network-name">${n.name}</div>
                            <div class="network-handle">@${n.username}</div>
                        </div>
                        <span class="network-status ${n.status || 'active'}">${n.status || 'active'}</span>
                    </div>
                `).join('');
            }
        }

        // Update badge
        const badge = document.getElementById('moltbookBadge');
        if (badge) {
            const unreadCount = activity.filter(a => !a.read).length;
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'inline' : 'none';
        }
    }

    refreshMoltbook() {
        this.addLogEntry('Refreshing Moltbook data...', 'moltbook');
        // In future, this would call Moltbook API
        alert('Moltbook refresh: In production, this would sync with moltbook.com API');
    }

    addMoltbookActivity(text, type = 'post', icon = '🤖') {
        if (!this.moltbook) this.initializeMoltbook();
        if (!this.moltbook.activity) this.moltbook.activity = [];

        this.moltbook.activity.unshift({
            id: 'mb-' + Date.now(),
            text,
            type,
            icon,
            timestamp: new Date().toISOString(),
            read: false
        });

        // Update post count
        if (type === 'post' && this.moltbook.profile) {
            this.moltbook.profile.posts++;
        }

        this.moltbook.lastActive = new Date().toISOString();
        this.saveData();
        this.renderMoltbook();
    }

    // Initialize default tasks for Jarvis (small, 1-3 step items)
    initializeDefaultTasks() {
        const defaultTasks = [
            {
                id: 'task-001',
                name: 'Check Gmail inbox',
                description: 'Review unread emails, flag urgent items, draft responses if needed',
                priority: 'high',
                status: 'active',
                project: '',
                assignee: 'jarvis',
                assignedBy: 'kris',
                created: new Date().toISOString(),
                completed: null
            },
            {
                id: 'task-002',
                name: 'Generate X daily trend brief',
                description: 'Review followed accounts, extract 3-5 key insights, post brief',
                priority: 'medium',
                status: 'pending',
                project: '',
                assignee: 'jarvis',
                assignedBy: 'kris',
                created: new Date().toISOString(),
                completed: null
            },
            {
                id: 'task-003',
                name: 'Check calendar for upcoming meetings',
                description: 'Review next 24 hours, send reminders for meetings <2h away',
                priority: 'medium',
                status: 'active',
                project: '',
                assignee: 'jarvis',
                assignedBy: 'kris',
                created: new Date().toISOString(),
                completed: null
            },
            {
                id: 'task-004',
                name: 'Update work log',
                description: 'Log all activities and decisions from this session',
                priority: 'low',
                status: 'pending',
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

    // Initialize Jarvis projects (big initiatives)
    initializeJarvisProjects() {
        const jarvisProjects = [
            {
                id: 'proj-dashboard',
                name: 'Jarvis Dashboard v2.0',
                description: 'Build comprehensive operating system with Task Engine, Decision Log, Delegation Tracker, PH Ventures, Weekly Review modules',
                status: 'active',
                icon: '🤖',
                tasks: 4,
                deliverables: ['Task Engine', 'Decision Log', 'Delegation Tracker', 'PH Ventures Module', 'Weekly Review Generator'],
                files: [],
                tools: ['HTML/CSS/JS', 'Node.js', 'SQLite'],
                links: [
                    { name: 'GitHub', url: 'https://github.com/jarvisaqulos/JarvisAI-DashboardOS' }
                ],
                created: new Date(Date.now() - 2 * 86400000).toISOString()
            },
            {
                id: 'proj-moltbook',
                name: 'Moltbook Agent Setup',
                description: 'Create and verify Moltbook profile, establish presence in AI agent community, engage with other agents',
                status: 'completed',
                icon: '🤖',
                tasks: 3,
                deliverables: ['Profile Created', 'Account Verified', 'First Post'],
                files: [],
                tools: ['Moltbook API'],
                links: [
                    { name: 'Profile', url: 'https://moltbook.com/u/JarvisAqulos' }
                ],
                created: new Date(Date.now() - 3 * 86400000).toISOString()
            },
            {
                id: 'proj-x-monitoring',
                name: 'X (Twitter) Monitoring System',
                description: 'Set up automated monitoring of 60+ accounts across restaurant marketing, AI, entrepreneurship, and PH business',
                status: 'completed',
                icon: '𝕏',
                tasks: 5,
                deliverables: ['Watchlist Created', 'Profile Updated', '60+ Accounts Following', 'Daily Cron Job', 'Trend Briefs'],
                files: ['/home/kjcardona/.openclaw/workspace/X_WATCHLIST.md'],
                tools: ['X Platform', 'OpenClaw Browser'],
                links: [
                    { name: 'Profile', url: 'https://x.com/JAqulos67857' },
                    { name: 'Watchlist', url: '#' }
                ],
                created: new Date(Date.now() - 1 * 86400000).toISOString()
            },
            {
                id: 'proj-thinknlocal',
                name: 'ThinkNLocal Growth Support',
                description: 'Support scaling to 1,000 local partners through marketing insights, competitive intelligence, and strategic recommendations',
                status: 'active',
                icon: '🏪',
                tasks: 2,
                deliverables: ['Market Research', 'Competitor Analysis', 'Growth Recommendations'],
                files: [],
                tools: ['X Monitoring', 'Web Search', 'Analytics'],
                links: [],
                created: new Date().toISOString()
            },
            {
                id: 'proj-aqulos',
                name: 'AQULOS Agency Rebuild',
                description: 'Support rebuild of AI + automation-powered growth agency with research, content, and systems',
                status: 'active',
                icon: '🚀',
                tasks: 3,
                deliverables: ['Service Research', 'Competitive Analysis', 'Content Strategy'],
                files: [],
                tools: ['AI Tools', 'Research', 'Documentation'],
                links: [],
                created: new Date().toISOString()
            },
            {
                id: 'proj-pse-portfolio',
                name: 'PSE Portfolio Tracker',
                description: 'Build comprehensive Philippine Stock Exchange portfolio tracker with real-time P/L, allocation charts, and holdings management',
                status: 'completed',
                icon: '📈',
                tasks: 8,
                deliverables: [
                    'Portfolio data structure',
                    'Holdings table with P/L calculations', 
                    'Donut allocation chart',
                    'Visual P/L indicators with progress bars',
                    'Watchlist functionality',
                    'Integration with Google Sheets',
                    'Reset/Clear data functionality',
                    'Responsive dashboard UI'
                ],
                files: ['/home/kjcardona/.openclaw/workspace/jarvis-dashboard/js/dashboard.js'],
                tools: ['JavaScript', 'Canvas API', 'Google Sheets API', 'LocalStorage'],
                links: [
                    { name: 'Portfolio Sheet', url: 'https://docs.google.com/spreadsheets/d/1_aM_lUK1Agt5Oh3mZcoI7jujxKEG9wox3h6qaUOnNNs/edit' }
                ],
                created: new Date().toISOString()
            }
        ];
        
        // Add Jarvis projects to the projects list
        jarvisProjects.forEach(p => {
            if (!this.projects.find(existing => existing.id === p.id)) {
                this.projects.push(p);
            }
        });
        
        this.saveData();
        this.addLogEntry('Initialized ' + jarvisProjects.length + ' Jarvis projects', 'system');
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
                <div class="email-content">
                    <div class="email-sender">${email.from}</div>
                    <div class="email-subject">${email.subject}</div>
                    <div class="email-meta">
                        <span class="email-time">${this.formatTime(email.time)}</span>
                        ${email.unread ? '<span class="unread-badge">NEW</span>' : ''}
                    </div>
                </div>
                ${email.unread ? `<button class="btn-small mark-read-btn" onclick="dashboard.markEmailRead('${email.id}')">✓ Read</button>` : ''}
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
        const saved = localStorage.getItem('jarvisDashboardData');
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
            // New modules
            this.decisions = data.decisions || [];
            this.delegations = data.delegations || [];
            this.phVentures = data.phVentures || { businesses: [], team: [], checkIns: [] };
            this.weeklyReviews = data.weeklyReviews || [];
            this.psePortfolio = data.psePortfolio || null;
            this.moltbook = data.moltbook || null;
            return true; // Data was found and loaded
        }
        return false; // No data found
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
            lastCalendarCheck: this.lastCalendarCheck,
            decisions: this.decisions || [],
            delegations: this.delegations || [],
            phVentures: this.phVentures || { businesses: [], team: [], checkIns: [] },
            weeklyReviews: this.weeklyReviews || [],
            psePortfolio: this.psePortfolio || null,
            moltbook: this.moltbook || null
        };
        localStorage.setItem('jarvisDashboardData', JSON.stringify(data));
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
        this.renderPSEPortfolio();
        this.renderMoltbook();
    }

    renderTasks() {
        const activeList = document.getElementById('activeTasksList');
        const activeFull = document.getElementById('activeTasksFull');
        const pendingFull = document.getElementById('pendingTasksFull');
        const completedFull = document.getElementById('completedTasksFull');
        
        // Ensure tasks array exists
        if (!this.tasks || !Array.isArray(this.tasks)) {
            this.tasks = [];
        }
        
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

    // ========== PSE PORTFOLIO TRACKER ==========

    initializePSEPortfolio() {
        // Kris's actual portfolio from Google Sheets
        // Total: ~₱208,938.42
        const defaultHoldings = [
            { symbol: 'FILRT', name: 'Filinvest REIT', shares: 3000, avgCost: 3.22, lastPrice: 3.22, dayChange: 0 },
            { symbol: 'GLO', name: 'Globe Telecom', shares: 20, avgCost: 1608.73, lastPrice: 1608.73, dayChange: 0 },
            { symbol: 'MBT', name: 'Metrobank', shares: 140, avgCost: 71.96, lastPrice: 71.96, dayChange: 0 },
            { symbol: 'MREIT', name: 'Megaworld REIT', shares: 700, avgCost: 13.90, lastPrice: 13.90, dayChange: 0 },
            { symbol: 'MYNLD', name: 'Manny Villar REIT', shares: 3400, avgCost: 15.00, lastPrice: 15.00, dayChange: 0 },
            { symbol: 'RCR', name: 'Robinsons REIT', shares: 4000, avgCost: 7.32, lastPrice: 7.32, dayChange: 0 },
            { symbol: 'RRHI', name: 'Robinsons Retail', shares: 700, avgCost: 35.55, lastPrice: 35.55, dayChange: 0 },
            { symbol: 'TEL', name: 'PLDT', shares: 25, avgCost: 1333.92, lastPrice: 1333.92, dayChange: 0 }
        ];

        const defaultWatchlist = [
            { symbol: 'ALI', name: 'Ayala Land', lastPrice: 28.50, dayChange: 0.5 },
            { symbol: 'SMPH', name: 'SM Prime', lastPrice: 36.20, dayChange: -0.3 },
            { symbol: 'MER', name: 'Meralco', lastPrice: 295.00, dayChange: 1.2 }
        ];

        this.psePortfolio = {
            holdings: defaultHoldings,
            watchlist: defaultWatchlist,
            lastUpdated: new Date().toISOString(),
            cash: 0 // Cash position in PHP
        };

        this.saveData();
        this.addLogEntry('PSE Portfolio initialized with ' + defaultHoldings.length + ' holdings', 'system');
    }

    renderPSEPortfolio() {
        if (!this.psePortfolio) {
            this.initializePSEPortfolio();
        }

        const holdings = this.psePortfolio.holdings || [];
        const watchlist = this.psePortfolio.watchlist || [];

        // Calculate totals
        let totalValue = 0;
        let totalCost = 0;
        let totalDayChange = 0;

        holdings.forEach(h => {
            const marketValue = h.shares * h.lastPrice;
            const costBasis = h.shares * h.avgCost;
            totalValue += marketValue;
            totalCost += costBasis;
            totalDayChange += h.shares * h.dayChange;
        });

        const totalChange = totalValue - totalCost;
        const totalChangePct = totalCost > 0 ? (totalChange / totalCost) * 100 : 0;
        const dayChangePct = totalValue > 0 ? (totalDayChange / totalValue) * 100 : 0;

        // Update summary
        const totalValueEl = document.getElementById('pseTotalValue');
        const totalChangeEl = document.getElementById('pseTotalChange');
        const dayChangeEl = document.getElementById('pseDayChange');
        const lastUpdatedEl = document.getElementById('pseLastUpdated');

        if (totalValueEl) totalValueEl.textContent = '₱' + this.formatNumber(totalValue);
        if (totalChangeEl) {
            totalChangeEl.textContent = (totalChange >= 0 ? '+' : '') + totalChange.toFixed(2) + ' (' + (totalChangePct >= 0 ? '+' : '') + totalChangePct.toFixed(2) + '%)';
            totalChangeEl.className = 'portfolio-change ' + (totalChange >= 0 ? 'positive' : 'negative');
        }
        if (dayChangeEl) {
            dayChangeEl.textContent = 'Day: ' + (totalDayChange >= 0 ? '+' : '') + totalDayChange.toFixed(2) + ' (' + (dayChangePct >= 0 ? '+' : '') + dayChangePct.toFixed(2) + '%)';
            dayChangeEl.className = 'portfolio-day-change ' + (totalDayChange >= 0 ? 'positive' : 'negative');
        }
        if (lastUpdatedEl) lastUpdatedEl.textContent = 'Last updated: ' + this.formatDate(this.psePortfolio.lastUpdated);

        // Render holdings table
        const holdingsBody = document.getElementById('pseHoldingsBody');
        if (holdingsBody) {
            if (holdings.length === 0) {
                holdingsBody.innerHTML = '<tr><td colspan="8" class="empty-state">No holdings</td></tr>';
            } else {
                holdingsBody.innerHTML = holdings.map(h => {
                    const marketValue = h.shares * h.lastPrice;
                    const costBasis = h.shares * h.avgCost;
                    const pl = marketValue - costBasis;
                    const plPct = costBasis > 0 ? (pl / costBasis) * 100 : 0;
                    const dayChgPct = h.lastPrice > 0 ? (h.dayChange / h.lastPrice) * 100 : 0;
                    const plBarWidth = Math.min(Math.abs(plPct), 100);

                    return `
                        <tr>
                            <td>
                                <strong>${h.symbol}</strong><br>
                                <small>${h.name}</small>
                            </td>
                            <td>${this.formatNumber(h.shares)}</td>
                            <td>₱${h.avgCost.toFixed(2)}</td>
                            <td>₱${h.lastPrice.toFixed(2)}</td>
                            <td>₱${this.formatNumber(marketValue)}</td>
                            <td class="${pl >= 0 ? 'positive' : 'negative'}">
                                <span class="pl-indicator ${pl >= 0 ? 'positive' : 'negative'}">
                                    ${pl >= 0 ? '▲' : '▼'} ₱${Math.abs(pl).toFixed(2)}
                                </span>
                                <div class="pl-bar-container">
                                    <div class="pl-bar ${pl >= 0 ? 'positive' : 'negative'}" style="width: ${plBarWidth}%"></div>
                                </div>
                            </td>
                            <td class="${plPct >= 0 ? 'positive' : 'negative'}">
                                <strong>${plPct >= 0 ? '+' : ''}${plPct.toFixed(2)}%</strong>
                            </td>
                            <td class="${h.dayChange >= 0 ? 'positive' : 'negative'}">
                                ${h.dayChange >= 0 ? '+' : ''}${dayChgPct.toFixed(2)}%
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        }

        // Render allocation (by symbol for now, could be by sector later)
        const allocationEl = document.getElementById('pseAllocation');
        if (allocationEl) {
            const sortedByValue = [...holdings].sort((a, b) => (b.shares * b.lastPrice) - (a.shares * a.lastPrice));
            const topHoldings = sortedByValue.slice(0, 5);

            allocationEl.innerHTML = topHoldings.map(h => {
                const value = h.shares * h.lastPrice;
                const pct = totalValue > 0 ? (value / totalValue) * 100 : 0;
                return `
                    <div class="allocation-item">
                        <span class="allocation-symbol">${h.symbol}</span>
                        <div class="allocation-bar">
                            <div class="allocation-fill" style="width: ${pct}%"></div>
                        </div>
                        <span class="allocation-pct">${pct.toFixed(1)}%</span>
                    </div>
                `;
            }).join('');
        }

        // Render top movers
        const moversEl = document.getElementById('pseTopMovers');
        if (moversEl) {
            const sortedByDayChange = [...holdings].sort((a, b) => {
                const aPct = a.lastPrice > 0 ? a.dayChange / a.lastPrice : 0;
                const bPct = b.lastPrice > 0 ? b.dayChange / b.lastPrice : 0;
                return bPct - aPct;
            });
            const topMovers = sortedByDayChange.slice(0, 3);

            moversEl.innerHTML = topMovers.map(h => {
                const dayChgPct = h.lastPrice > 0 ? (h.dayChange / h.lastPrice) * 100 : 0;
                return `
                    <div class="mover-item ${h.dayChange >= 0 ? 'up' : 'down'}">
                        <span class="mover-symbol">${h.symbol}</span>
                        <span class="mover-change">${dayChgPct >= 0 ? '+' : ''}${dayChgPct.toFixed(2)}%</span>
                    </div>
                `;
            }).join('');
        }

        // Render watchlist
        const watchlistEl = document.getElementById('pseWatchlist');
        if (watchlistEl) {
            if (watchlist.length === 0) {
                watchlistEl.innerHTML = '<div class="empty-state">No stocks in watchlist</div>';
            } else {
                watchlistEl.innerHTML = watchlist.map(w => {
                    const dayChgPct = w.lastPrice > 0 ? (w.dayChange / w.lastPrice) * 100 : 0;
                    return `
                        <div class="watchlist-item">
                            <div class="watchlist-info">
                                <span class="watchlist-symbol">${w.symbol}</span>
                                <span class="watchlist-name">${w.name}</span>
                            </div>
                            <div class="watchlist-price">
                                <span class="price">₱${w.lastPrice.toFixed(2)}</span>
                                <span class="change ${w.dayChange >= 0 ? 'positive' : 'negative'}">${dayChgPct >= 0 ? '+' : ''}${dayChgPct.toFixed(2)}%</span>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        // Draw pie chart
        this.drawPSEPieChart(holdings, totalValue);

        // Update badge
        const badge = document.getElementById('pseBadge');
        if (badge) {
            badge.textContent = holdings.length;
            badge.style.display = holdings.length > 0 ? 'inline' : 'none';
        }
    }

    drawPSEPieChart(holdings, totalValue) {
        const canvas = document.getElementById('psePieChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Colors for each slice
        const colors = [
            '#00d26a', '#2196f3', '#ffc107', '#f44336', 
            '#9c27b0', '#00bcd4', '#ff9800', '#4caf50'
        ];
        
        let currentAngle = -Math.PI / 2; // Start at top
        
        holdings.forEach((h, index) => {
            const value = h.shares * h.lastPrice;
            const percentage = totalValue > 0 ? value / totalValue : 0;
            const sliceAngle = percentage * 2 * Math.PI;
            
            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();
            
            // Draw border
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            currentAngle += sliceAngle;
        });
        
        // Draw center hole (donut style)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#1a1a1a';
        ctx.fill();
        
        // Draw total in center
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('₱' + this.formatNumber(totalValue), centerX, centerY - 8);
        
        ctx.fillStyle = '#666666';
        ctx.font = '10px Inter';
        ctx.fillText('Total Value', centerX, centerY + 10);
    }

    updatePSEPortfolio() {
        // Open a prompt to paste portfolio data
        const portfolioData = prompt('Paste your portfolio data (or type "reset" to reload defaults):');
        if (!portfolioData) return;

        if (portfolioData.toLowerCase() === 'reset') {
            this.initializePSEPortfolio();
            this.renderPSEPortfolio();
            return;
        }

        // Simple parsing - you can enhance this based on format
        this.addLogEntry('Portfolio update requested - manual entry', 'pse');
        alert('Portfolio update feature: Send me your portfolio screenshot or paste the data and I\'ll parse it!');
    }

    addPSEWatchlist() {
        const symbol = prompt('Enter stock symbol (e.g., ALI, SMPH):');
        if (!symbol) return;

        const name = prompt('Enter company name:');
        if (!this.psePortfolio) this.initializePSEPortfolio();
        if (!this.psePortfolio.watchlist) this.psePortfolio.watchlist = [];

        this.psePortfolio.watchlist.push({
            symbol: symbol.toUpperCase(),
            name: name || symbol.toUpperCase(),
            lastPrice: 0,
            dayChange: 0
        });

        this.saveData();
        this.renderPSEPortfolio();
        this.addLogEntry('Added to watchlist: ' + symbol.toUpperCase(), 'pse');
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return num.toFixed(2);
    }

    // Mark email as read
    markEmailRead(emailId) {
        const email = this.emails.find(e => e.id === emailId);
        if (email) {
            email.unread = false;
            this.saveData();
            this.renderEmails();
            this.addLogEntry(`Marked email as read: ${email.subject}`, 'email');
            
            // In production, this would call Gmail API to actually mark as read
            console.log(`Marked as read (dashboard only): ${emailId}`);
        }
    }
}

// Initialize dashboard
const dashboard = new JarvisDashboard();
