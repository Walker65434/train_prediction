import morgan from 'morgan';
import { format } from 'date-fns';

morgan.token('timestamp', () => format(new Date(), 'dd-MM-yyyy HH:mm:ss'));

morgan.token('ip', (req) => {
  return (
    req.headers['x-forwarded-for'] ||
    req.ip?.replace('::ffff:', '') ||
    'unknown'
  );
});

morgan.token('statusIcon', (req, res) => {
  const status = res.statusCode;
  if (status >= 500) return '❌';
  if (status >= 400) return '⚠️ ';
  if (status >= 300) return '↪️ ';
  return '✅';
});

const logger = morgan(
  '[:timestamp] :ip :statusIcon :method :url :status (:response-time ms) - ":user-agent"'
);

export default logger;
