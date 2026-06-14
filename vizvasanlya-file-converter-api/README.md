# File Converter API

![License](https://img.shields.io/badge/license-MIT-blue)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)

A file conversion service API with job queue management, progress tracking, and async processing.

## Features

- **Job Creation** — Submit conversion jobs with input/output type specification
- **Async Processing** — Simulated async conversion with progress tracking
- **Job Management** — List, check status, retry, and delete conversion jobs
- **Supported Formats** — PNG, JPG, JPEG, WebP, PDF, TXT, MD
- **Output Serving** — Download converted files via static endpoint
- **Health Check** — Service health endpoint

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Service health check |
| `POST` | `/jobs` | Create a new conversion job |
| `GET` | `/jobs` | List all conversion jobs |
| `GET` | `/jobs/:id` | Get job status and details |
| `POST` | `/jobs/:id/process` | Retry a failed job |
| `DELETE` | `/jobs/:id` | Delete a conversion job |
| `GET` | `/output/:filename` | Download converted file |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Processing | Async setTimeout pipeline |
| Storage | JSON file + filesystem |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/vizvasanlya/First.git
cd First/vizvasanlya-file-converter-api
npm install
```

### Run

```bash
npm start
```

Server starts on [http://localhost:3000](http://localhost:3000)

### Docker

```bash
docker compose up --build
```

## Example Usage

```bash
# Create a conversion job
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -d '{"filename":"photo.jpg","inputType":"jpg","outputType":"png"}'

# Check job status
curl http://localhost:3000/jobs/<job_id>

# List all jobs
curl http://localhost:3000/jobs
```

## License

MIT
