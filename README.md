# File Converter API

MVP conversion job API with validation, queue status, simulated processing, output storage, and job management.

## Features

- `POST /jobs`
- `GET /jobs`
- `GET /jobs/:id`
- `POST /jobs/:id/process`
- `DELETE /jobs/:id`
- File type validation
- Queue, processing, completed, and error states
- Static output directory for generated files

## Run

```bash
npm install
npm start
```

## Health

```bash
curl http://localhost:3000/health
```

## Create job

```bash
curl -X POST http://localhost:3000/jobs   -H 'Content-Type: application/json'   -d '{"filename":"report.pdf","inputType":"pdf","outputType":"txt"}'
```
