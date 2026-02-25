import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // API Route for Telegram
  app.post('/api/send-telegram', async (req, res) => {
    const { name, phone, email, course, level, notes } = req.body;

    const TELEGRAM_BOT_TOKEN = '8502293707:AAF6av-xox6V5VR3pm2AfpJl3_ADYCXPVOk';
    const CHAT_ID = '7660331704';

    const courseMap: Record<string, string> = {
      'english': 'اللغة الإنجليزية',
      'icdl': 'الرخصة الدولية ICDL',
      'graphics': 'تصميم الجرافيكس'
    };

    const levelMap: Record<string, string> = {
      'beginner': 'مبتدئ',
      'intermediate': 'متوسط',
      'advanced': 'متقدم'
    };

    const courseArabic = courseMap[course] || course;
    const levelArabic = levelMap[level] || level;

    const message = `
🔔 *تسجيل جديد في المعهد*

👤 *الاسم:* ${name}
📱 *الهاتف:* ${phone}
📧 *البريد:* ${email}
📚 *الدورة:* ${courseArabic}
📊 *المستوى:* ${levelArabic}
📝 *ملاحظات:* ${notes || 'لا يوجد'}
    `;

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      const data = await response.json();

      if (data.ok) {
        res.json({ success: true });
      } else {
        console.error('Telegram API Error:', data);
        res.status(500).json({ success: false, error: data.description });
      }
    } catch (error) {
      console.error('Server Error:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
