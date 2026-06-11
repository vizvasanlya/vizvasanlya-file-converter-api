const express = require('express');

const app = express();
const jobs = new Map();

app.use(express.json());

function jobId() {
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeType(value) {
  return String(value || '').toLowerCase().replace('.', '');
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'file-converter-api' });
});

app.post('/jobs', (req, res) => {
  const { inputType, outputType, filename } = req.body || {};
  const supported = ['png', 'jpg', 'jpeg', 'webp', 'pdf', 'txt', 'md'];
  if (!supported.includes(normalizeType(inputType)) || !supported.includes(normalizeType(outputType)) || !filename) {
    return res.status(400).json({ error: 'Provide filename, inputType, and outputType.' });
  }

  const id = jobId();
  const job = {
    id,
    filename,
    inputType: normalizeType(inputType),
    outputType: normalizeType(outputType),
    status: 'queued',
    progress: 0,
    createdAt: new Date().toISOString()
  };

  jobs.set(id, job);
  setTimeout(() => {
    const current = jobs.get(id);
    if (current) {
      current.status = 'completed';
      current.progress = 100;
      current.outputUrl = `/files/${id}.${current.outputType}`;
    }
  }, 1500);

  return res.status(201).json(job);
});

app.get('/jobs', (req, res) => {
  res.json([...jobs.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
});

app.get('/jobs/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found.' });
  }
  return res.json(job);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`file-converter-api listening on ${port}`);
});
