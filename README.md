# Adaptive Learning System Deployment Guide

This guide provides step-by-step instructions to deploy the Adaptive Learning System on Linux Mint. The system consists of a Node.js/Express backend, a React frontend, and uses MariaDB for data storage.

## Table of Contents
1.  [System Requirements](#system-requirements)
2.  [Prerequisites](#prerequisites)
3.  [Database Setup](#database-setup)
    *   [MariaDB Installation](#mariadb-installation)
    *   [Database Initialization](#database-initialization)
    *   [Using an External Hard Drive (Optional)](#using-an-external-hard-drive-optional)
4.  [Backend Setup](#backend-setup)
5.  [Frontend Setup](#frontend-setup)
6.  [Running the Application](#running-the-application)
7.  [Docker Setup (Optional)](#docker-setup-optional)

## 1. System Requirements

*   **Operating System**: Linux Mint (or any Debian-based Linux distribution)
*   **RAM**: 16GB or more
*   **Storage**: At least 500GB external hard drive (optional, but recommended for data storage)

## 2. Prerequisites

Ensure the following software is installed on your Linux Mint system:

### Node.js and pnpm

Node.js (LTS version recommended) and pnpm are required for both backend and frontend development. If not already installed, follow these steps:

```bash
sudo apt update
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

sudo npm install -g pnpm
```

Verify installation:

```bash
node -v
pnpm -v
```

### MariaDB Server

MariaDB is the chosen database for this system. Install it via the terminal:

```bash
sudo apt update
sudo apt install -y mariadb-server
```

Secure your MariaDB installation (set root password, remove anonymous users, disallow remote root login, remove test database):

```bash
sudo mysql_secure_installation
```

During the `mysql_secure_installation` process, you will be prompted to set a root password. **Remember this password** as it will be used in the `backend/.env` file and `setup_db.sh` script.

### Python3 and pip3

Python3 and pip3 are typically pre-installed on Linux Mint. They are used for generating hashed passwords for sample data.

```bash
python3 --version
pip3 --version
```

If `pip3` is not found, install it:

```bash
sudo apt install -y python3-pip
```

## 3. Database Setup

### MariaDB Installation

(Covered in Prerequisites section)

### Database Initialization

Navigate to the project root directory where `schema.sql` and `sample_data.sql` are located. Then run the setup script:

```bash
cd /path/to/your/project
chmod +x setup_db.sh
./setup_db.sh
```

When prompted, enter the MariaDB root password you set during `mysql_secure_installation`.

### Using an External Hard Drive (Optional)

To store your MariaDB data on an external 500GB hard drive, you need to:

1.  **Mount the external drive**: Ensure your external drive is formatted (e.g., ext4) and mounted to a specific directory, for example, `/mnt/external_data`.

    ```bash
sudo mkdir -p /mnt/external_data
sudo mount /dev/sdX1 /mnt/external_data # Replace sdX1 with your drive partition
    ```

    To make it persistent across reboots, add an entry to `/etc/fstab`.

2.  **Change MariaDB data directory**: Edit the MariaDB configuration file (e.g., `/etc/mysql/mariadb.conf.d/50-server.cnf` or `/etc/my.cnf`). Locate the `datadir` variable under the `[mysqld]` section and change its value to your mounted external drive path (e.g., `datadir = /mnt/external_data/mysql`).

    ```bash
sudo nano /etc/mysql/mariadb.conf.d/50-server.cnf
    ```

    Change:
    `datadir = /var/lib/mysql`
    To:
    `datadir = /mnt/external_data/mysql`

3.  **Copy existing data (if any)**: If MariaDB already has data, stop the service, copy the contents of the old data directory to the new one, and then restart.

    ```bash
sudo systemctl stop mariadb
sudo rsync -av /var/lib/mysql/ /mnt/external_data/mysql/
sudo chown -R mysql:mysql /mnt/external_data/mysql
sudo systemctl start mariadb
    ```

4.  **Adjust AppArmor (if enabled)**: If AppArmor is enabled, you might need to update its configuration to allow MariaDB to access the new data directory. Edit `/etc/apparmor.d/usr.sbin.mysqld` and add the new path.

    ```bash
sudo nano /etc/apparmor.d/usr.sbin.mysqld
    ```

    Add lines like:
    `/mnt/external_data/mysql/ r,`
    `/mnt/external_data/mysql/** rwk,`

    Then reload AppArmor:

    ```bash
sudo systemctl reload apparmor
    ```

## 4. Backend Setup

1.  **Navigate to the backend directory**:

    ```bash
cd /path/to/your/project/backend
    ```

2.  **Install dependencies**:

    ```bash
pnpm install
    ```

3.  **Configure environment variables**: Create a `.env` file in the `backend` directory based on the provided `.env.example` (or use the one already provided).

    ```ini
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mariadb_root_password # IMPORTANT: Use the password you set during mysql_secure_installation
DB_NAME=adaptive_learning_db
PORT=5000
JWT_SECRET=supersecretjwtkey_replace_with_a_strong_one
    ```

    **Note**: Replace `your_mariadb_root_password` with your actual MariaDB root password and `supersecretjwtkey_replace_with_a_strong_one` with a strong, unique secret for JWT.

## 5. Frontend Setup

1.  **Navigate to the frontend directory**:

    ```bash
cd /path/to/your/project/frontend
    ```

2.  **Install dependencies**:

    ```bash
pnpm install
    ```

## 6. Running the Application

### Start the Backend

In the `backend` directory, run:

```bash
cd /path/to/your/project/backend
pnpm start
```

The backend server will start on `http://localhost:5000`.

### Start the Frontend

In a separate terminal, navigate to the `frontend` directory and run:

```bash
cd /path/to/your/project/frontend
pnpm run dev --host
```

The frontend development server will start, usually on `http://localhost:5173` (or another available port). Open this URL in your web browser.

## 7. Docker Setup (Optional)

For easier portability and environment consistency, you can containerize the application using Docker.

1.  **Install Docker and Docker Compose**:

    Follow the official Docker documentation for installation on Linux Mint:
    [Install Docker Engine on Debian](https://docs.docker.com/engine/install/debian/)
    [Install Docker Compose](https://docs.docker.com/compose/install/)

2.  **Create `Dockerfile` for Backend** (in `backend` directory):

    ```dockerfile
FROM node:lts-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install --prod
COPY . .
EXPOSE 5000
CMD ["pnpm", "start"]
    ```

3.  **Create `Dockerfile` for Frontend** (in `frontend` directory):

    ```dockerfile
FROM node:lts-alpine as build
WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
RUN pnpm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
    ```

4.  **Create `docker-compose.yml`** (in the project root directory):

    ```yaml
version: '3.8'

services:
  db:
    image: mariadb:10.6
    environment:
      MARIADB_ROOT_PASSWORD: your_mariadb_root_password
      MARIADB_DATABASE: adaptive_learning_db
    volumes:
      - mariadb_data:/var/lib/mysql
      - ./schema.sql:/docker-entrypoint-initdb.d/10-schema.sql
      - ./sample_data.sql:/docker-entrypoint-initdb.d/20-sample_data.sql
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mariadb-admin", "ping", "-h", "localhost", "-u", "root", "-p$$MARIADB_ROOT_PASSWORD"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DB_HOST: db
      DB_USER: root
      DB_PASSWORD: your_mariadb_root_password
      DB_NAME: adaptive_learning_db
      JWT_SECRET: supersecretjwtkey_replace_with_a_strong_one
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mariadb_data:
    driver: local
    ```

    **Note**: Replace `your_mariadb_root_password` and `supersecretjwtkey_replace_with_a_strong_one` with your chosen values. For the external hard drive, you would need to configure Docker volumes to map to your external drive mount point.

5.  **Build and Run with Docker Compose**:

    ```bash
cd /path/to/your/project
docker compose up --build -d
    ```

    The application will be accessible via `http://localhost` for the frontend and `http://localhost:5000` for the backend API.

## References

*   [1] Node.js. (n.d.). *Node.js Documentation*. Retrieved from [https://nodejs.org/en/docs/](https://nodejs.org/en/docs/)
*   [2] MariaDB. (n.d.). *MariaDB Documentation*. Retrieved from [https://mariadb.com/docs/](https://mariadb.com/docs/)
*   [3] React. (n.d.). *React Documentation*. Retrieved from [https://react.dev/](https://react.dev/)
*   [4] Docker. (n.d.). *Docker Documentation*. Retrieved from [https://docs.docker.com/](https://docs.docker.com/)

