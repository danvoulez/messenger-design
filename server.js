const express = require('express');
const path = require('path');
const apiApp = require('./api/index');

const app = express();

// Serve API routes
app.use('/api', apiApp);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 UBL Console running on http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/health`);
  console.log(`🎨 UI: http://localhost:${PORT}`);
});
