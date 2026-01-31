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
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.startClock();
        this.renderAll();
        this.addLogEntry('Dashboard initialized', 'system');
        
        // Initial status
        this.setStatus('idle');
        
        console.log('🤖 Jarvis Aqulos Dashboard initialized');
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
            workLog: this.workLog
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

    // Task Management
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
        
        const task = {
            id: Date.now().toString(),
            name,
            description: desc,
            priority,
            status,
            project,
            eta,
            created: new Date().toISOString(),
            completed: status === 'completed' ? new Date().toISOString() : null
        };
        
        this.tasks.push(task);
        this.saveData();
        this.renderTasks();
        this.closeModal();
        this.addLogEntry(`Task created: ${name}`, 'task');
        
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
        this.renderStats();
        this.updateStatusUI();
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
        activeList.innerHTML = active.length ? active.map(t => this.renderTaskItem(t)).join('') : '<div class="empty-state">No active tasks</div>';
        activeFull.innerHTML = active.length ? active.map(t => this.renderTaskDetailed(t)).join('') : '<div class="empty-state">No active tasks</div>';
        pendingFull.innerHTML = pending.length ? pending.map(t => this.renderTaskDetailed(t)).join('') : '<div class="empty-state">No pending tasks</div>';
        completedFull.innerHTML = completed.length ? completed.slice(0, 10).map(t => this.renderTaskDetailed(t)).join('') : '<div class="empty-state">No completed tasks</div>';
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
                    <div class="task-name">${task.name}</div>
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
            alert(`Task: ${task.name}\nDescription: ${task.description || 'None'}\nPriority: ${task.priority}\nStatus: ${task.status}`);
        }
    }
}

// Initialize dashboard
const dashboard = new JarvisDashboard();
