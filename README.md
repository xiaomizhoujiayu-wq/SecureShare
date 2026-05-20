# SecureShare

SecureShare is an online file sharing platform with fine-grained access control based on Attribute-Based Encryption (ABE).  
Users can upload encrypted files, define access policies, and share files securely with users whose attributes satisfy the required policy.

## Project Overview

This repository contains the frontend application for SecureShare.

### Features
- User registration and login
- File upload and encrypted storage
- Fine-grained access control using Attribute-Based Encryption (ABE)
- Hybrid encryption using AES + ABE
- Attribute-based file sharing
- Private sharing by user ID
- File explorer for browsing uploaded files
- Admin and sub-admin user management
- Attribute assignment and management
- Responsive frontend interface

### System Architecture

The system follows a frontend-backend architecture:
- **Frontend:** React + TypeScript + Vite (This repository)
- **Backend:** [ABE-Cloud-Storage](https://github.com/ACDD233/ABE-Cloud-Storage) (Spring Boot)
- **Database:** MariaDB
- **Encryption:**
  - AES is used for fast file encryption
  - ABE is used to protect the AES session key and enforce access policies

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/UI
- Axios
- Lucide React

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/xiaomizhoujiayu-wq/SecureShare.git
cd SecureShare
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```
The frontend should be available at: `http://localhost:5173`

## Main Functions

### User
- Register and log in
- View personal attributes
- Upload and encrypt files
- Select access policies
- Browse accessible files
- Download authorized files

### Admin
- View users
- Assign attributes
- Manage available system attributes
- Create sub-admin accounts

## Notes
- Ensure the backend service is running before testing file upload and download functions.
- The frontend API requests are configured to communicate with the backend at `http://localhost:8080` by default.
- For production use, configure appropriate environment variables.

## Contributors
- Project team members

## Deployment

### Environment Variables

The frontend uses environment variables for configuration. Create a `.env` file based on `.env.example`:

```bash
VITE_API_BASE_URL=http://your-server-ip:8080
```

### Using Podman (or Docker)

You can containerize the application using the provided `Dockerfile`. 

**Note on Build Time Variables**: Since this is a static React build, the API URL must be provided during the **build** phase.

1. **Build the image**:
   ```bash
   # Provide your backend URL during build
   podman build --build-arg VITE_API_BASE_URL=http://your-server-ip:8080 -t secureshare .
   ```

2. **Run the container**:
   ```bash
   # Map host port 80 to container port 80
   podman run -d --name secureshare-frontend -p 80:80 secureshare
   ```

## License
This project is developed for academic purposes.
