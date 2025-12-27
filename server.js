const express = require('express');
const path = require('path');
const apiApp = require('./api/index');

const app = express();

// Serve API routes
app.use('/api', apiApp);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 UBL Console running on http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/health`);
  console.log(`🎨 UI: http://localhost:${PORT}`);
});
