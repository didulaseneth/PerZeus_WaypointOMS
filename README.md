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

**Backend (Integration in Progress):**
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
└── backend/                    # Spring Boot + MongoDB (Coming Soon)
```
## ⚙️ Local Setup Instructions
**Prerequisites
* Node.js (v18+)
* Java (v17+)
* Maven
* MongoDB (Local or Atlas)

## Running the Frontend
Clone the repository:

```text
git clone [https://github.com/didulaseneth/PerZeus_WaypointOMS.git](https://github.com/didulaseneth/PerZeus_WaypointOMS.git)
```

Navigate to the frontend directory:

```text
cd PerZeus_WaypointOMS/frontend
```

Install dependencies:

```text
npm install
```

Start the development server:

```text
npm run dev
```

Access the application:
Open http://localhost:5173 in your browser. Use the provided dev-bypass buttons on the landing page to preview different persona views.

Built with ❤️ by Team PerZeus for the Tech-Triathlon Hackathon.
