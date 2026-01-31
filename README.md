# 🤖 Jarvis Aqulos — Dark Mode Operating System

A comprehensive dashboard for strategic operations, task management, project tracking, and goal alignment.

## 🎨 UI / Visual Directive

**Dark Mode Default:**
- **Background:** Charcoal / near-black (`#0d0d0d`)
- **Panels:** Dark gray with subtle contrast (`#1a1a1a`, `#252525`)
- **Accent Colors:**
  - 🟢 **Active** — `#00d26a`
  - 🟡 **Idle / Ready** — `#ffc107`
  - 🔵 **Planning** — `#2196f3`
  - 🔴 **Blocked** — `#f44336`
- **Typography:** Clean, minimal, system-style (Inter + JetBrains Mono)
- **Layout:** Modular panels, status-first design, dense but readable

## ⚙️ Core Dashboard Modules

### 🔔 System Status Panel
- Current state: Active | Idle | Planning | Blocked
- Current task(s) with progress
- Last action timestamp
- Next expected update
- **Visual indicator pulses when Active**

### 🧩 Task Engine
- **Active Tasks** — Currently in progress
- **Pending Tasks** — Waiting to start
- **Completed Tasks** — History of work done
- Features: Priority levels, project assignment, ETA tracking, dependencies

### 📂 Project & Work Log
- Project tracking with deliverables
- Files created/modified
- Tools used
- External links (GitHub, Google Drive, etc.)
- Complete audit trail of progress

### 📬 Communication & Calendar
- **Email Tracking** — Flag important emails, summarize content, track follow-ups
- **Calendar** — Meetings, deadlines, milestones, conflict detection
- **Google Drive** — Recent documents by project

### 🎯 Goals & KPI Control Center
- **2026 North Star Goals:**
  1. Scale ThinkNLocal to 1,000 partners
  2. Rebuild AQULOS (AI + automation agency)
  3. Philippine Ventures operational success
- Progress indicators
- Risk and blocker tracking
- Alignment warnings (drift detection)

### 📚 Resource Vault
- Save bookmarks and references
- Queue articles, videos, tools
- Tag by topic/project
- Status tracking: To Review → In Progress → Completed
- On-demand summarization

### 🧠 Operating Rules
- Think like an OS, not a chatbot
- Default to structure, visibility, continuity
- Be proactive, not reactive
- Never lose historical context
- Dashboards > paragraphs

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)

### Installation
```bash
cd jarvis-dashboard
npm install
npm start
```

### Access
Open browser to: `http://localhost:3000`

## 🗣️ Communication Mode

- Concise
- Structured
- Status-driven
- No fluff unless asked

## 🧾 Dashboard Philosophy

This system is the **single place** to understand:
- ✅ What has been done
- 🔄 What is in progress
- 🚫 What is blocked
- ➡️ What is next

## 📊 Quick Stats

Real-time metrics tracked:
- Tasks completed
- Active projects
- Resources saved
- Work log entries

## 🔧 Data Persistence

Data is stored in browser `localStorage` by default. Optional server-side persistence available via `/api/data` endpoints.

---

**Jarvis Aqulos — Operate Accordingly.**
