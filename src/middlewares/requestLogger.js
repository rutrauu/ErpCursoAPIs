const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log da requisição
  console.log(`📥 ${req.method} ${req.originalUrl} - ${req.ip} - ${new Date().toISOString()}`);
  
  // Interceptar a resposta para log
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    console.log(`📤 ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    originalSend.call(this, data);
  };

  next();
};

module.exports = requestLogger;