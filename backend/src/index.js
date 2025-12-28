const generateToken = (userId, JWT_SECRET) => {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const payload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
  };

  const encode = (obj) => {
    return btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  const sign = (data, secret) => {
    const text = new TextEncoder().encode(data);
    const key = new TextEncoder().encode(secret);
    return crypto.subtle
      .importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
      .then(key => crypto.subtle.sign('HMAC', key, text))
      .then(signature => {
        const signatureArray = Array.from(new Uint8Array(signature));
        const signatureString = btoa(String.fromCharCode.apply(null, signatureArray))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
        return signatureString;
      });
  };

  const encodedHeader = encode(header);
  const encodedPayload = encode(payload);
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  return sign(dataToSign, JWT_SECRET).then(signature => {
    return `${dataToSign}.${signature}`;
  });
};

const verifyToken = (token, JWT_SECRET) => {
  const [encodedHeader, encodedPayload, signature] = token.split('.');

  if (!encodedHeader || !encodedPayload || !signature) {
    return Promise.reject('Invalid token format');
  }

  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const sign = (data, secret) => {
    const text = new TextEncoder().encode(data);
    const key = new TextEncoder().encode(secret);
    return crypto.subtle
      .importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
      .then(key => crypto.subtle.sign('HMAC', key, text))
      .then(signature => {
        const signatureArray = Array.from(new Uint8Array(signature));
        const signatureString = btoa(String.fromCharCode.apply(null, signatureArray))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
        return signatureString;
      });
  };

  return sign(dataToSign, JWT_SECRET).then(expectedSignature => {
    if (signature !== expectedSignature) {
      return Promise.reject('Invalid token signature');
    }

    const payload = JSON.parse(atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/')));

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return Promise.reject('Token expired');
    }

    return payload;
  });
};

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

class Database {
  constructor(kv) {
    this.kv = kv;
  }

  async get(key) {
    const value = await this.kv.get(key, 'json');
    return value;
  }

  async put(key, value, options) {
    await this.kv.put(key, JSON.stringify(value), options);
  }

  async delete(key) {
    await this.kv.delete(key);
  }

  async list(prefix) {
    const list = await this.kv.list({ prefix });
    return list.keys;
  }
}

class UserService {
  constructor(db) {
    this.db = db;
  }

  async get(phone) {
    const users = await this.db.get('users') || [];
    return users.find(user => user.phone === phone);
  }

  async getById(id) {
    const users = await this.db.get('users') || [];
    return users.find(user => user.id === id);
  }

  async getByWechatOpenId(openId) {
    const users = await this.db.get('users') || [];
    return users.find(user => user.wechat_open_id === openId);
  }

  async getAll() {
    return await this.db.get('users') || [];
  }

  async insert(user) {
    const users = await this.db.get('users') || [];
    users.push(user);
    await this.db.put('users', users);
    return user;
  }

  async update(id, updates) {
    const users = await this.db.get('users') || [];
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      await this.db.put('users', users);
      return users[index];
    }
    return null;
  }

  async delete(id) {
    const users = await this.db.get('users') || [];
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      const deleted = users.splice(index, 1);
      await this.db.put('users', users);
      return deleted[0];
    }
    return null;
  }
}

class VerificationCodeService {
  constructor(db) {
    this.db = db;
  }

  async getValid(phone, code) {
    const codes = await this.db.get('verificationCodes') || [];
    const now = new Date();
    return codes.find(c => 
      c.phone === phone && 
      c.code === code && 
      c.used === 0 &&
      new Date(c.expires_at) > now
    );
  }

  async insert(codeData) {
    const codes = await this.db.get('verificationCodes') || [];
    codes.push(codeData);
    await this.db.put('verificationCodes', codes);
  }

  async markUsed(id) {
    const codes = await this.db.get('verificationCodes') || [];
    const index = codes.findIndex(c => c.id === id);
    if (index !== -1) {
      codes[index].used = 1;
      await this.db.put('verificationCodes', codes);
    }
  }
};

class WechatSessionService {
  constructor(db) {
    this.db = db;
  }

  async get(sessionId) {
    const sessions = await this.db.get('wechatSessions') || [];
    return sessions.find(s => s.id === sessionId);
  }

  async insert(sessionData) {
    const sessions = await this.db.get('wechatSessions') || [];
    sessions.push(sessionData);
    await this.db.put('wechatSessions', sessions);
  }

  async update(sessionId, updates) {
    const sessions = await this.db.get('wechatSessions') || [];
    const index = sessions.findIndex(s => s.id === sessionId);
    if (index !== -1) {
      sessions[index] = { ...sessions[index], ...updates };
      await this.db.put('wechatSessions', sessions);
      return sessions[index];
    }
    return null;
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const db = new Database(env.DATA);
    const users = new UserService(db);
    const verificationCodes = new VerificationCodeService(db);
    const wechatSessions = new WechatSessionService(db);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (url.pathname === '/api/auth/send-code' && request.method === 'POST') {
        const body = await request.json();
        const { phone } = body;

        if (!phone || phone.length !== 11) {
          return new Response(JSON.stringify({
            success: false,
            message: '手机号码格式不正确'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const code = generateCode();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

        await verificationCodes.insert({
          id: Date.now(),
          phone,
          code,
          created_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          used: 0
        });

        console.log(`[验证码] 手机号: ${phone}, 验证码: ${code}, 过期时间: ${expiresAt.toLocaleString('zh-CN')}`);

        return new Response(JSON.stringify({
          success: true,
          message: '验证码已发送',
          code: code
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (url.pathname === '/api/auth/login' && request.method === 'POST') {
        const body = await request.json();
        const { phone, code } = body;

        if (!phone || !code) {
          return new Response(JSON.stringify({
            success: false,
            message: '手机号码和验证码不能为空'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const validCode = await verificationCodes.getValid(phone, code);

        if (!validCode) {
          return new Response(JSON.stringify({
            success: false,
            message: '验证码无效或已过期'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        await verificationCodes.markUsed(validCode.id);

        const SUPER_ADMIN_PHONE = env.SUPER_ADMIN_PHONE || '13510420462';
        let user = await users.get(phone);

        const now = new Date();
        const nowStr = now.toISOString();

        if (!user) {
          const userId = 'user_' + Date.now();
          const userType = phone === SUPER_ADMIN_PHONE ? 'admin' : 'trial';
          const expiryDate = userType === 'admin' ? null : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

          user = await users.insert({
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
          await users.update(user.id, { last_login_at: nowStr });

          if (phone === SUPER_ADMIN_PHONE) {
            user = await users.update(user.id, { user_type: 'admin' });
          }
        }

        const token = await generateToken(user.id, env.JWT_SECRET);

        return new Response(JSON.stringify({
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
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (url.pathname === '/api/auth/wechat-login' && request.method === 'POST') {
        const body = await request.json();
        const { openId } = body;

        if (!openId) {
          return new Response(JSON.stringify({
            success: false,
            message: 'OpenID不能为空'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const now = new Date();
        const nowStr = now.toISOString();
        let user = await users.getByWechatOpenId(openId);

        if (!user) {
          const userId = 'wechat_user_' + Date.now();
          const expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

          user = await users.insert({
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
          await users.update(user.id, { last_login_at: nowStr });
        }

        const token = await generateToken(user.id, env.JWT_SECRET);

        return new Response(JSON.stringify({
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
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (url.pathname === '/api/auth/wechat/qrcode' && request.method === 'POST') {
        const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

        const qrCodeUrl = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiB2aWV3Qm94PSIwIDAgMjU2IDI1NiI+PHJlY3Qgd2lkdGg9IjI1NiIgaGVpZ2h0PSIyNTYiIGZpbGw9IiNmZmZmZmYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzMzMyI+6L+Z6YeM55So5oGv6KejPC90ZXh0Pjwvc3ZnPg==`;

        await wechatSessions.insert({
          id: sessionId,
          qr_code_url: qrCodeUrl,
          status: 'waiting',
          user_id: null,
          created_at: now.toISOString(),
          expires_at: expiresAt.toISOString()
        });

        console.log(`[微信二维码] 会话ID: ${sessionId}`);

        return new Response(JSON.stringify({
          success: true,
          qrCodeUrl,
          sessionId,
          message: '二维码已生成'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (url.pathname.match(/^\/api\/auth\/wechat\/status\/.+/) && request.method === 'GET') {
        const sessionId = url.pathname.split('/').pop();
        const now = new Date();

        const session = await wechatSessions.get(sessionId);

        if (!session) {
          return new Response(JSON.stringify({
            status: 'expired'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (new Date(session.expires_at) < now) {
          return new Response(JSON.stringify({
            status: 'expired'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (session.status === 'confirmed' && session.user_id) {
          const user = await users.getById(session.user_id);

          if (user) {
            const token = await generateToken(user.id, env.JWT_SECRET);
            return new Response(JSON.stringify({
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
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        }

        return new Response(JSON.stringify({
          status: session.status
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (url.pathname === '/api/auth/users' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ success: false, message: '未授权' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const token = authHeader.substring(7);
        try {
          const decoded = await verifyToken(token, env.JWT_SECRET);
          const currentUser = await users.getById(decoded.userId);

          if (!currentUser || currentUser.user_type !== 'admin') {
            return new Response(JSON.stringify({ success: false, message: '权限不足' }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          const userList = await users.getAll();

          return new Response(JSON.stringify({
            success: true,
            users: userList.map(user => ({
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
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({ success: false, message: '无效的令牌' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      if (url.pathname.match(/^\/api\/auth\/users\/.+$/) && request.method === 'DELETE') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ success: false, message: '未授权' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const token = authHeader.substring(7);
        const userId = url.pathname.split('/').pop();

        try {
          const decoded = await verifyToken(token, env.JWT_SECRET);
          const currentUser = await users.getById(decoded.userId);

          if (!currentUser || currentUser.user_type !== 'admin') {
            return new Response(JSON.stringify({ success: false, message: '权限不足' }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          await users.delete(userId);

          return new Response(JSON.stringify({ success: true, message: '用户已删除' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({ success: false, message: '无效的令牌' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      if (url.pathname.match(/^\/api\/auth\/users\/.+\/type$/) && request.method === 'PATCH') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ success: false, message: '未授权' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const token = authHeader.substring(7);
        const userId = url.pathname.split('/')[4];

        try {
          const decoded = await verifyToken(token, env.JWT_SECRET);
          const currentUser = await users.getById(decoded.userId);

          if (!currentUser || currentUser.user_type !== 'admin') {
            return new Response(JSON.stringify({ success: false, message: '权限不足' }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          const body = await request.json();
          const { userType, expiryDate } = body;

          await users.update(userId, { user_type: userType, expiry_date: expiryDate || null });

          return new Response(JSON.stringify({ success: true, message: '用户类型已更新' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({ success: false, message: '无效的令牌' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      return new Response(JSON.stringify({
        success: false,
        message: '未找到请求的端点'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({
        success: false,
        message: '服务器错误',
        error: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
