# AVR GARMENT Management System

A comprehensive dashboard for managing garment production workflows, designed to streamline operations from cloth reception to final garment collection.

## Project Overview

**AVR Garment Management System** helps track the complete lifecycle of garment production. The system provides role-based dashboards to ensure transparency, accountability, and smooth coordination between different stages of production.

Authentication and data storage are securely managed using **Supabase**, enabling role-based login, real-time data updates, and reliable database handling.

🔗 **Project URL**:  
👉 [https://laxmikantvarkal1.github.io/AVR-garment/](https://laxmikantvarkal1.github.io/AVR-garment/)

---

## Roles and Features

### 🔑 Admin
- Full access to all parties, items, and production data  
- User and workflow management  
- Overall production monitoring  

### ✂️ Cutting
- Track cutting processes and quantities  
- Update cutting status and cutting dates  

### 📦 Distributor
- Manage distribution of cut pieces to workers  
- Track size-wise allocations  

### 🧺 Collector
- Log and track finished garment collections  
- Update collection quantities and dates  

---

## Data Structure (Garment Data)

The core tracking entity in this system is the **Party**, which represents a client or source. Each Party contains multiple **Items**.

### Party
- `id`: Unique identifier for the party  
- `party_name`: Name of the client (e.g., "ABC Textiles")  
- `items`: Array of garment orders associated with the party  

---

### Item

Each item represents a specific garment order.

#### Identity
- `id`: Unique Item ID (e.g., "10001")  
- `name`: Garment type (e.g., "panjabi", "shirt")  
- `description`: Additional details about the item  

#### Production Metrics
- `recived`: Quantity of cloth received (e.g., "8000m")  
- `cuttting`: Quantity of cloth cut (e.g., "1000m")  
- `collected`: Quantity or status of finished garments  

#### Distribution & Tracking
- `sizes`: Array of size distributions  
  - Example: `["34:10", "36:12"]`  
- `user`: List of assigned workers/users  

#### Timeline
- `givenClothDate`: Date when the cloth was received  
- `cuttingDate`: Scheduled or actual cutting date  
- `collectDate`: Scheduled or actual collection date  

---

## Tech Stack

- React  
- TypeScript  
- Vite  
- Supabase (Authentication & Database)

---

## Key Highlights

- Role-based access control  
- End-to-end garment production tracking  
- Real-time database updates with Supabase  
- Clean and scalable data structure  
- Designed for small to medium garment operations  

