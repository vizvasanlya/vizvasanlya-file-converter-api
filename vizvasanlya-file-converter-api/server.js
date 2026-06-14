const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const DATA_FILE = path.join(__dirname, 'data.json');
const OUTPUT_DIR = path.join(__dirname, 'output');

app.use(express.json({ limit: '1mb' }));
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function load() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { jobs: [] };
  }
}

function save(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function jobId() {
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalize(value) {
  return String(value || '').toLowerCase().replace('.', '');
}

function publicJob(job) {
  return {
    id: job.id,
    filename: job.filename,
    inputType: job.inputType,
    outputType: job.outputType,
    status: job.status,
    progress: job.progress,
    outputUrl: job.outputUrl || null,
    error: job.error || null,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt
  };
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'file-converter-api' });
});

app.post('/jobs', (req, res) => {
  const { inputType, outputType, filename } = req.body || {};
  const supported = ['png', 'jpg', 'jpeg', 'webp', 'pdf', 'txt', 'md'];
  if (!supported.includes(normalize(inputType)) || !supported.includes(normalize(outputType)) || !filename) {
    return res.status(400).json({ error: 'Provide filename, inputType, and outputType.' });
  }

  const data = load();
  const job = {
    id: jobId(),
    filename: String(filename).slice(0, 120),
    inputType: normalize(inputType),
    outputType: normalize(outputType),
    status: 'queued',
    progress: 0,
    outputUrl: null,
    error: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  data.jobs.unshift(job);
  save(data);

  setTimeout(() => {
    const current = load().jobs.find((entry) => entry.id === job.id);
    if (!current || current.status !== 'queued') return;
    current.status = 'processing';
    current.progress = 45;
    current.updatedAt = new Date().toISOString();
    save(load());

    setTimeout(() => {
      const next = load().jobs.find((entry) => entry.id === job.id);
      if (!next || next.status !== 'processing') return;
      const outputName = `${next.id}.${next.outputType}`;
      fs.writeFileSync(path.join(OUTPUT_DIR, outputName), `Converted placeholder for ${next.filename}\n`);
      next.status = 'completed';
      next.progress = 100;
      next.outputUrl = `/output/${outputName}`;
      next.updatedAt = new Date().toISOString();
      save(load());
    }, 900);
  }, 600);

  return res.status(201).json(publicJob(job));
});

app.get('/jobs', (req, res) => {
  const data = load();
  res.json(data.jobs.map(publicJob));
});

app.get('/jobs/:id', (req, res) => {
  const job = load().jobs.find((entry) => entry.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found.' });
  res.json(publicJob(job));
});

app.post('/jobs/:id/process', (req, res) => {
  const data = load();
  const job = data.jobs.find((entry) => entry.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found.' });
  if (job.status === 'completed') return res.json(publicJob(job));
  job.status = 'queued';
  job.progress = 0;
  job.error = null;
  job.updatedAt = new Date().toISOString();
  save(data);
  res.json(publicJob(job));
});

app.delete('/jobs/:id', (req, res) => {
  const data = load();
  const before = data.jobs.length;
  data.jobs = data.jobs.filter((job) => job.id !== req.params.id);
  if (data.jobs.length === before) return res.status(404).json({ error: 'Job not found.' });
  save(data);
  res.json({ deleted: req.params.id });
});

app.use('/output', express.static(OUTPUT_DIR));
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`file-converter-api listening on ${port}`);
});
