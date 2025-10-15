# Oracle Cloud Infrastructure (OCI) Free Tier Deployment Guide for Adaptive Learning System Backend

This guide outlines the steps to deploy the Node.js/Express backend and MariaDB database of the Adaptive Learning System to Oracle Cloud Infrastructure (OCI) Free Tier. This will provide a free and persistent cloud environment for your backend services.

## Table of Contents
1.  [Prerequisites](#prerequisites)
2.  [OCI Account Setup](#oci-account-setup)
3.  [Creating a Free Tier Compute Instance](#creating-a-free-tier-compute-instance)
4.  [Connecting to Your Instance](#connecting-to-your-instance)
5.  [Instance Setup: MariaDB and Node.js](#instance-setup-mariadb-and-node.js)
    *   [Update and Install Dependencies](#update-and-install-dependencies)
    *   [MariaDB Installation and Configuration](#mariadb-installation-and-configuration)
    *   [Node.js and pnpm Installation](#node.js-and-pnpm-installation)
6.  [Deploying the Backend Application](#deploying-the-backend-application)
7.  [Configuring Network Security (Firewall and Security Lists)](#configuring-network-security-firewall-and-security-lists)
8.  [Testing the Backend](#testing-the-backend)
9.  [Updating Frontend API URL](#updating-frontend-api-url)

## 1. Prerequisites

*   **Oracle Cloud Account**: You need an Oracle Cloud account. This requires a credit card for identity verification, but you will not be charged for Always Free resources.
*   **SSH Client**: A terminal with SSH client (e.g., OpenSSH on Linux/macOS, PuTTY on Windows).
*   **Project Files**: The `backend` directory, `schema.sql`, `sample_data.sql`, and `setup_db.sh` from the Adaptive Learning System project.

## 2. OCI Account Setup

1.  **Sign Up for Oracle Cloud Free Tier**: Go to the [Oracle Cloud Free Tier page](https://www.oracle.com/cloud/free/) and sign up. Follow the instructions to create your account, including verifying your email and providing credit card details for identity verification.
2.  **Login to OCI Console**: Once your account is active, log in to the [OCI Console](https://cloud.oracle.com/).

## 3. Creating a Free Tier Compute Instance

1.  **Navigate to Compute Instances**: In the OCI Console, open the navigation menu (☰) and go to **Compute** > **Instances**.
2.  **Create Instance**: Click **Create Instance**.
3.  **Instance Details**:
    *   **Name**: Provide a descriptive name (e.g., `adaptive-learning-backend`).
    *   **Placement**: Choose an **Always Free-eligible** Availability Domain and Fault Domain.
    *   **Image and Shape**:
        *   **Image**: Click **Change Image** and select `Ubuntu` (e.g., `Ubuntu 22.04 Minimal`). Ensure it's an Always Free-eligible image.
        *   **Shape**: Click **Change Shape**. Under **Specialty and previous generation**, select `VM.Standard.E2.1.Micro` (Always Free-eligible).
    *   **Networking**: Ensure it uses an **Always Free-eligible** Virtual Cloud Network (VCN) and subnet. If you don't have one, create a new VCN with default settings.
    *   **Add SSH keys**: This is crucial for connecting to your instance. Select **Generate a key pair for me** and **Save Private Key** and **Save Public Key**. Alternatively, you can **Upload public key files** if you have an existing SSH key pair. **Keep your private key secure!**
    *   **Boot Volume**: Leave default (should be Always Free-eligible).
4.  **Create**: Click **Create** to launch the instance. It may take a few minutes for the instance to provision and start running.

## 4. Connecting to Your Instance

1.  **Get Public IP**: Once the instance is running, note its **Public IP address** from the instance details page.
2.  **SSH Command**: Open your terminal and use the following command, replacing `[PRIVATE_KEY_PATH]` with the path to your saved private SSH key and `[PUBLIC_IP_ADDRESS]` with your instance's public IP:

    ```bash
    ssh -i [PRIVATE_KEY_PATH] ubuntu@[PUBLIC_IP_ADDRESS]
    ```
    If you generated a key pair, the username is typically `ubuntu` for Ubuntu images.

    *   **Permissions**: If you get a 
