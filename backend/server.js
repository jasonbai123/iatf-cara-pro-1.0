const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const db = require('./database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

app.use(cors());
app.use(bodyParser.json());

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
};

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

app.post('/auth/send-code', (req, res) => {
  const { phone } = req.body;

  if (!phone || phone.length !== 11) {
    return res.json({
      success: false,
      message: '手机号码格式不正确'
    });
  }

  const code = generateCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

  db.verificationCodes.insert({
    id: Date.now(),
    phone,
    code,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    used: 0
  });

  console.log(`[验证码] 手机号: ${phone}, 验证码: ${code}, 过期时间: ${expiresAt.toLocaleString('zh-CN')}`);

  res.json({
    success: true,
    message: '验证码已发送'
  });
});

app.post('/auth/login', (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.json({
      success: false,
      message: '手机号码和验证码不能为空'
    });
  }

  const validCode = db.verificationCodes.getValid(phone, code);

  if (!validCode) {
    return res.json({
      success: false,
      message: '验证码无效或已过期'
    });
  }

  db.verificationCodes.markUsed(validCode.id);

  const SUPER_ADMIN_PHONE = process.env.SUPER_ADMIN_PHONE || '13510420462';
  let user = db.users.get(phone);

  const now = new Date();
  const nowStr = now.toISOString();

  if (!user) {
    const userId = 'user_' + Date.now();
    const userType = phone === SUPER_ADMIN_PHONE ? 'admin' : 'trial';
    const expiryDate = userType === 'admin' ? null : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    user = db.users.insert({
      id: userId,
      phone,
      nickname: '用户' + phone.slice(-4),
      avatar: '',
      user_type: userType,
      expiry_date: expiryDate,
      wechat_open_id: null,
      created_at: nowStr,
      last_login_at: nowStr
    });
  } else {
    db.users.update(user.id, { last_login_at: nowStr });

    if (phone === SUPER_ADMIN_PHONE) {
      user = db.users.update(user.id, { user_type: 'admin' });
    }
  }

  const token = generateToken(user.id);

  res.json({
    success: true,
    message: '登录成功',
    user: {
      id: user.id,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      userType: user.user_type,
      expiryDate: user.expiry_date,
      wechatOpenId: user.wechat_open_id,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at
    },
    token
  });
});

app.post('/auth/wechat-login', (req, res) => {
  const { openId } = req.body;

  if (!openId) {
    return res.json({
      success: false,
      message: 'OpenID不能为空'
    });
  }

  const now = new Date();
  const nowStr = now.toISOString();
  let user = db.users.getByWechatOpenId(openId);

  if (!user) {
    const userId = 'wechat_user_' + Date.now();
    const expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    user = db.users.insert({
      id: userId,
      phone: '',
      nickname: '微信用户',
      avatar: '',
      user_type: 'trial',
      wechat_open_id: openId,
      expiry_date: expiryDate,
      created_at: nowStr,
      last_login_at: nowStr
    });
  } else {
    db.users.update(user.id, { last_login_at: nowStr });
  }

  const token = generateToken(user.id);

  res.json({
    success: true,
    message: '微信登录成功',
    user: {
      id: user.id,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      userType: user.user_type,
      expiryDate: user.expiry_date,
      wechatOpenId: user.wechat_open_id,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at
    },
    token
  });
});

app.post('/auth/wechat/qrcode', (req, res) => {
  const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

  const qrCodeUrl = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiB2aWV3Qm94PSIwIDAgMjU2IDI1NiI+PHJlY3Qgd2lkdGg9IjI1NiIgaGVpZ2h0PSIyNTYiIGZpbGw9IiNmZmZmZmYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzMzMyI+6L+Z6YeM55So5oGv6KejPC90ZXh0Pjwvc3ZnPg==`;

  db.wechatSessions.insert({
    id: sessionId,
    qr_code_url: qrCodeUrl,
    status: 'waiting',
    user_id: null,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString()
  });

  console.log(`[微信二维码] 会话ID: ${sessionId}`);

  res.json({
    success: true,
    qrCodeUrl,
    sessionId,
    message: '二维码已生成'
  });
});

app.get('/auth/wechat/status/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const now = new Date();

  const session = db.wechatSessions.get(sessionId);

  if (!session) {
    return res.json({
      status: 'expired'
    });
  }

  if (new Date(session.expires_at) < now) {
    return res.json({
      status: 'expired'
    });
  }

  if (session.status === 'confirmed' && session.user_id) {
    const user = db.users.getById(session.user_id);

    if (user) {
      const token = generateToken(user.id);
      return res.json({
        status: 'confirmed',
        user: {
          id: user.id,
          phone: user.phone,
          nickname: user.nickname,
          avatar: user.avatar,
          userType: user.user_type,
          expiryDate: user.expiry_date,
          wechatOpenId: user.wechat_open_id,
          createdAt: user.created_at,
          lastLoginAt: user.last_login_at
        },
        token
      });
    }
  }

  res.json({
    status: session.status
  });
});

app.get('/auth/users', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '未授权' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = db.users.getById(decoded.userId);

    if (!currentUser || currentUser.user_type !== 'admin') {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    const users = db.users.getAll();

    res.json({
      success: true,
      users: users.map(user => ({
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        userType: user.user_type,
        expiryDate: user.expiry_date,
        wechatOpenId: user.wechat_open_id,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at
      }))
    });
  } catch (error) {
    res.status(401).json({ success: false, message: '无效的令牌' });
  }
});

app.delete('/auth/users/:userId', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '未授权' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = db.users.getById(decoded.userId);

    if (!currentUser || currentUser.user_type !== 'admin') {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    db.users.delete(req.params.userId);

    res.json({ success: true, message: '用户已删除' });
  } catch (error) {
    res.status(401).json({ success: false, message: '无效的令牌' });
  }
});

app.patch('/auth/users/:userId/type', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '未授权' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentUser = db.users.getById(decoded.userId);

    if (!currentUser || currentUser.user_type !== 'admin') {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    const { userType, expiryDate } = req.body;

    db.users.update(req.params.userId, { user_type: userType, expiry_date: expiryDate || null });

    res.json({ success: true, message: '用户类型已更新' });
  } catch (error) {
    res.status(401).json({ success: false, message: '无效的令牌' });
  }
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`超级管理员手机号: ${process.env.SUPER_ADMIN_PHONE || '13510420462'}`);
});
