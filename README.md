# VibeCode

> An AI-powered, collaborative coding platform for building and deploying web applications on the Cloudflare edge.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/HLKC779/generated-app-20251001-005047)

VibeCode is an AI-native, collaborative coding platform designed to streamline the entire development lifecycle on the Cloudflare edge. It integrates multiple AI providers through a unified gateway for intelligent code generation, offers an advanced system of official and community-driven project templates, and provides a secure, resource-managed sandboxing environment for code execution and testing. The platform features extended deployment options to various targets including Cloudflare Workers and Pages, complete with custom domain support and detailed analytics. At its core, VibeCode is built for teamwork, with real-time collaboration features like shared cursors and live editing powered by Durable Objects, alongside seamless Git integration for version control.

## Table of Contents

- [✨ Key Features](#-key-features)
- [🚀 Technology Stack](#-technology-stack)
- [🏁 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [🔧 Usage](#-usage)
- [💻 Development](#-development)
  - [Project Structure](#project-structure)
  - [Available Scripts](#available-scripts)
- [☁️ Deployment](#️-deployment)
- [🏗️ Architecture](#️-architecture)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## ✨ Key Features

- **Unified AI Gateway**: Integrates with multiple AI providers (Gemini, OpenAI, Anthropic) for intelligent code generation and assistance.
- **Advanced Template System**: A marketplace of official and community-driven project templates stored on R2 to kickstart development.
- **Secure Sandboxing**: Isolated and resource-managed environments for secure code execution and testing.
- **Multi-Target Deployment**: Deploy applications seamlessly to Cloudflare Workers, Pages, and other platforms.
- **Real-time Collaboration**: Live, collaborative coding with shared cursors and editing, powered by Cloudflare Durable Objects.
- **Version Control Integration**: Connect to GitHub repositories for seamless version control and code management.
- **Built on Cloudflare**: Leverages the full power of the Cloudflare stack, including Workers, Pages, D1, R2, and KV.

## 🚀 Technology Stack

- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Hono on Cloudflare Workers
- **State Management**: Zustand
- **Real-time**: Cloudflare Durable Objects
- **Database**: Cloudflare D1
- **Storage**: Cloudflare R2
- **AI**: Cloudflare AI Gateway, OpenAI SDK
- **UI Components**: Lucide React, Framer Motion, React Resizable Panels

## 🏁 Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing purposes.

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine.
- A [Cloudflare account](https://dash.cloudflare.com/sign-up).
- `wrangler` CLI, which can be installed with `bun install -g wrangler`.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/vibecode.git
    cd vibecode
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

3.  **Set up environment variables:**
    Create a `.dev.vars` file in the root of the project and add your Cloudflare and AI provider credentials. You can use the `wrangler.jsonc` file as a reference.

    ```ini
    # .dev.vars

    # Cloudflare AI Gateway Credentials
    CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai"
    CF_AI_API_KEY="YOUR_CLOUDFLARE_API_KEY"

    # Optional: For web search tool
    SERPAPI_KEY="YOUR_SERPAPI_KEY"
    ```

4.  **Run the development server:**
    This command starts the Vite frontend and the `wrangler` dev server for the backend worker.
    ```sh
    bun run dev
    ```

The application should now be running on `http://localhost:3000`.

## 🔧 Usage

Once the application is running, you can navigate to `http://localhost:3000` in your browser.

- **Dashboard**: View and manage your projects.
- **IDE**: The core coding environment with a file tree, editor, AI chat, and preview panel.
- **Templates**: Browse and start new projects from pre-built templates.
- **AI Chat**: Use the integrated AI assistant to generate code, ask questions, and get help.

## 💻 Development

This project is a monorepo-style setup with the frontend and backend codebases in separate directories.

### Project Structure

-   `src/`: Contains the React frontend application code.
-   `worker/`: Contains the Hono backend application running on Cloudflare Workers.
-   `wrangler.jsonc`: Configuration file for the Cloudflare Worker.

### Available Scripts

-   `bun run dev`: Starts the development server for both frontend and backend.
-   `bun run build`: Builds the frontend application for production.
-   `bun run lint`: Lints the codebase.
-   `bun run deploy`: Deploys the application to Cloudflare.

## ☁️ Deployment

This application is designed to be deployed on the Cloudflare network.

1.  **Authenticate with Cloudflare:**
    ```sh
    bunx wrangler login
    ```

2.  **Deploy the application:**
    Run the deploy script from the root of the project. This will build the frontend and deploy the worker.
    ```sh
    bun run deploy
    ```

Wrangler will handle the deployment process and provide you with the URL of your deployed application.

Alternatively, you can deploy directly from your GitHub repository using the button below.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/HLKC779/generated-app-20251001-005047)

## 🏗️ Architecture

The platform is a serverless application running entirely on Cloudflare. The frontend is a React SPA served via Cloudflare Pages. The backend is a set of Cloudflare Workers running a Hono API. Stateful logic for real-time collaboration and sandbox sessions is delegated to Durable Objects. The AI Gateway acts as a proxy and caching layer to multiple downstream AI providers. Data is stored across Cloudflare's ecosystem: D1 for relational metadata, R2 for large assets, and KV for caching.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue to discuss any changes.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more information.