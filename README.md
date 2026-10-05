# 🚀 Waypoint Group OMS - Team PerZeus

> An Enterprise-Grade Order Management System built for the **Tech-Triathlon Hackathon 2026**.

## 📌 Project Overview
Waypoint OMS is a robust, scalable, and highly responsive Order Management System designed to streamline supply chain operations. The system provides dedicated, role-optimized interfaces for four distinct personas, ensuring seamless coordination from the warehouse to the final delivery destination.

To tackle real-world supply chain challenges like blind spots and network drops, our mobile interfaces are built as **Progressive Web Apps (PWAs)** with **Offline-First Capabilities**.

## 🏗️ Architecture & Tech Stack
We utilize a **Monorepo Architecture** to house both our frontend and backend, enabling rapid development and streamlined deployments during the hackathon.

**Frontend:**
* **React.js (Vite):** Fast, modern UI development.
* **TailwindCSS:** Rapid, utility-first styling for mobile-responsive designs.
* **React Router:** Role-based route guarding.
* **PWA / Service Workers:** Offline caching and background synchronization.

**Backend:** 
* **Java Spring Boot (v3.x):** Enterprise-grade RESTful API.
* **MongoDB:** Flexible NoSQL database for handling varied order structures.
* **JWT:** Secure authentication and Role-Based Access Control (RBAC).

## 👥 Supported Personas & Features
1. **Dispatcher (Operations Dashboard):** Desktop-optimized view for allocating orders, tracking live delivery routes, and managing fleets.
2. **Store Manager (Portal):** Desktop view to monitor incoming inventory, verify received orders, and track store-specific analytics.
3. **Driver (Mobile PWA):** Mobile-first application designed with large tap targets. Supports **offline mode** to mark deliveries as complete even in areas with zero network coverage (auto-syncs when online).
4. **Loader (Mobile PWA):** Mobile-optimized interface for warehouse staff to scan/update loading statuses efficiently.

## 📁 Repository Structure
```text
PerZeus_WaypointOMS/
│
├── frontend/                   # React + Tailwind (Vite) Application
│   ├── src/
│   │   ├── components/         # Reusable UI elements
│   │   ├── pages/              # Persona-specific modules (driver, loader, etc.)
│   │   └── services/           # API integration logic
│   └── package.json
│
└── backend/                    # Spring Boot + MongoDB
```
## ⚙️ Local Setup Instructions
To run this project locally, you only need Docker installed on your machine.   

### 1. Clone the repository:
```Bash
git clone https://github.com/didulaseneth/PerZeus_WaypointOMS.git
cd PerZeus_WaypointOMS
```
### 2. Start the complete stack (Frontend, Backend, Database, and Seed Data):  
```Bash
docker compose up
```
### 3. The frontend application will be available at http://localhost:5173 and the backend APIs at http://localhost:8080.

## 🔑 Seeded Account Details
Use the following credentials to test the application across the four distinct user roles.

| Role | Username | Password |
|------|----------|----------|
| Dispatcher | `dispatcher` | `dispatch123` |
| Store Manager | `out001` | `store123` |
| Loader | `loader01` | `loader123` |
| Driver | `driver001` | `driver123` |

## 📝 Departures from Designathon
  Our hackathon implementation closely follows the high-fidelity prototypes submitted during the Designathon phase. No significant structural departures were made. Minor UI adjustments were implemented solely to ensure pixel-perfect responsiveness on mobile devices for the Driver and Loader applications.   
  
Built with ❤️ by Team PerZeus for the Tech-Triathlon Hackathon.
