import express from 'express';
import helmet from 'helmet';
import cookieSession from 'cookie-session';
import pg from 'pg';
import { OAuth2Client } from 'google-auth-library';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const app = express();
const port = Number(process.env.PORT || 10000);
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');
if (!process.env.SESSION_SECRET) throw new Error('SESSION_SECRET is required');

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || undefined);
const adminEmails = new Set((process.env.CEP_ADMIN_EMAILS || '').split(',').map(v => v.trim().toLowerCase()).filter(Boolean));
const normalizeName = (value='') => String(value).replace(/\s+/g,' ').trim().slice(0,40);
const isAdminEmail = email => adminEmails.has(String(email || '').toLowerCase());
const currentUser = req => req.session?.user || null;
const requireAuth = (req,res,next) => currentUser(req) ? next() : res.status(401).json({error:'LOGIN_REQUIRED'});
const requireAdmin = (req,res,next) => currentUser(req)?.isAdmin ? next() : res.status(403).json({error:'CEP_ADMIN_REQUIRED'});

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false, crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' } }));
app.use(express.json({limit:'64kb'}));
app.use(cookieSession({
  name: 'cep_session',
  keys: [process.env.SESSION_SECRET],
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 1000 * 60 * 60 * 24 * 7
}));
app.use(express.static(path.join(root,'public'), { extensions:['html'], maxAge:'1h' }));

app.get('/healthz', async (_req,res) => {
  try { await pool.query('SELECT 1'); res.json({ok:true}); }
  catch { res.status(503).json({ok:false}); }
});
app.get('/api/config', (_req,res) => res.json({googleClientId:process.env.GOOGLE_CLIENT_ID || '', googleConfigured:Boolean(process.env.GOOGLE_CLIENT_ID)}));
app.get('/api/me', (req,res) => res.json({user:currentUser(req)}));

app.post('/api/auth/google', async (req,res) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) return res.status(503).json({error:'GOOGLE_NOT_CONFIGURED'});
    const credential = String(req.body?.credential || '');
    const desiredName = normalizeName(req.body?.displayName || '');
    if (!credential) return res.status(400).json({error:'MISSING_CREDENTIAL'});
    const ticket = await googleClient.verifyIdToken({idToken:credential,audience:process.env.GOOGLE_CLIENT_ID});
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email || !payload.email_verified) return res.status(401).json({error:'INVALID_GOOGLE_ACCOUNT'});
    if (!payload.email.toLowerCase().endsWith('@gmail.com') && !isAdminEmail(payload.email)) return res.status(403).json({error:'GMAIL_REQUIRED'});
    const fallback = normalizeName(payload.name || payload.email.split('@')[0]);
    const displayName = desiredName.length >= 2 ? desiredName : fallback;
    const result = await pool.query(`
      INSERT INTO qa_users (google_sub,email,display_name) VALUES ($1,$2,$3)
      ON CONFLICT (google_sub) DO UPDATE SET email=EXCLUDED.email, updated_at=NOW()
      RETURNING id,email,display_name,is_hidden`, [payload.sub,payload.email.toLowerCase(),displayName]);
    const row = result.rows[0];
    req.session.user = {id:Number(row.id),email:row.email,displayName:row.display_name,isHidden:row.is_hidden,isAdmin:isAdminEmail(row.email)};
    res.json({user:req.session.user});
  } catch (err) {
    console.error('Google login failed:', err?.message || err);
    res.status(401).json({error:'GOOGLE_LOGIN_FAILED'});
  }
});

app.post('/api/profile', requireAuth, async (req,res) => {
  const name = normalizeName(req.body?.displayName || '');
  if (name.length < 2) return res.status(400).json({error:'DISPLAY_NAME_TOO_SHORT'});
  const result = await pool.query('UPDATE qa_users SET display_name=$1,updated_at=NOW() WHERE id=$2 RETURNING display_name',[name,currentUser(req).id]);
  req.session.user.displayName = result.rows[0].display_name;
  res.json({user:req.session.user});
});
app.post('/api/logout',(req,res)=>{req.session=null;res.json({ok:true});});

app.get('/api/messages', async (req,res) => {
  const admin = Boolean(currentUser(req)?.isAdmin);
  const where = admin ? `m.status <> 'deleted'` : `m.status='visible' AND u.is_hidden=FALSE`;
  const result = await pool.query(`
    SELECT m.id,m.reply_to,m.body,m.status,m.created_at,u.id AS user_id,u.display_name,u.is_hidden,u.email
    FROM qa_messages m JOIN qa_users u ON u.id=m.user_id
    WHERE ${where}
    ORDER BY m.created_at DESC LIMIT 200`);
  res.json({messages:result.rows.reverse().map(r=>({
    id:Number(r.id),replyTo:r.reply_to?Number(r.reply_to):null,body:r.body,status:r.status,createdAt:r.created_at,
    user:{id:Number(r.user_id),displayName:r.display_name,isHidden:r.is_hidden,isAdmin:isAdminEmail(r.email)}
  }))});
});

app.post('/api/messages', requireAuth, async (req,res) => {
  const user = currentUser(req);
  const status = await pool.query('SELECT is_hidden FROM qa_users WHERE id=$1',[user.id]);
  if (status.rows[0]?.is_hidden) return res.status(403).json({error:'USER_HIDDEN'});
  const body = String(req.body?.body || '').trim();
  const replyTo = req.body?.replyTo ? Number(req.body.replyTo) : null;
  if (!body || body.length > 2000) return res.status(400).json({error:'INVALID_MESSAGE'});
  const result = await pool.query('INSERT INTO qa_messages (user_id,reply_to,body) VALUES ($1,$2,$3) RETURNING id,created_at',[user.id,replyTo,body]);
  res.status(201).json({id:Number(result.rows[0].id),createdAt:result.rows[0].created_at});
});

app.patch('/api/admin/messages/:id', requireAuth, requireAdmin, async (req,res) => {
  const id = Number(req.params.id); const action = String(req.body?.action || '');
  const map = {hide:'hidden',show:'visible',delete:'deleted'};
  if (!map[action]) return res.status(400).json({error:'INVALID_ACTION'});
  await pool.query('UPDATE qa_messages SET status=$1,updated_at=NOW() WHERE id=$2',[map[action],id]);
  res.json({ok:true});
});
app.patch('/api/admin/users/:id', requireAuth, requireAdmin, async (req,res) => {
  const id = Number(req.params.id); const hidden = Boolean(req.body?.hidden);
  await pool.query('UPDATE qa_users SET is_hidden=$1,updated_at=NOW() WHERE id=$2',[hidden,id]);
  res.json({ok:true});
});

app.get('/{*splat}', (_req,res) => res.sendFile(path.join(root,'public','index.html')));
app.listen(port,'0.0.0.0',()=>console.log(`CEP listening on 0.0.0.0:${port}`));
