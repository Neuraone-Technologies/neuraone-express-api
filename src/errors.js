export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = error.status >= 400 && error.status <= 599 ? error.status : 500;
  const message = error.type === 'entity.parse.failed' ? 'Invalid JSON body' : status < 500 ? error.message : 'Internal server error';
  res.status(status).json({ error: { message }, requestId: req.requestId });
}
export function fail(status, message) {
  return Object.assign(new Error(message), { status });
}
