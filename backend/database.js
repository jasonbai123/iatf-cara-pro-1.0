const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data.json');

const loadData = () => {
  if (fs.existsSync(dataPath)) {
    try {
      const data = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  }
  return {
    users: [],
    verificationCodes: [],
    wechatSessions: []
  };
};

const saveData = (data) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('保存数据失败:', error);
  }
};

const SUPER_ADMIN_PHONE = process.env.SUPER_ADMIN_PHONE || '13510420462';

const data = loadData();

const existingAdmin = data.users.find(user => user.phone === SUPER_ADMIN_PHONE);
if (!existingAdmin) {
  const now = new Date().toISOString();
  data.users.push({
    id: 'super_admin_' + Date.now(),
    phone: SUPER_ADMIN_PHONE,
    nickname: '超级管理员',
    avatar: '',
    user_type: 'admin',
    expiry_date: null,
    wechat_open_id: null,
    created_at: now,
    last_login_at: now
  });
  saveData(data);
  console.log('超级管理员账号已创建:', SUPER_ADMIN_PHONE);
}

const db = {
  users: {
    get: (phone) => data.users.find(user => user.phone === phone),
    getById: (id) => data.users.find(user => user.id === id),
    getByWechatOpenId: (openId) => data.users.find(user => user.wechat_open_id === openId),
    getAll: () => data.users,
    insert: (user) => {
      data.users.push(user);
      saveData(data);
      return user;
    },
    update: (id, updates) => {
      const index = data.users.findIndex(user => user.id === id);
      if (index !== -1) {
        data.users[index] = { ...data.users[index], ...updates };
        saveData(data);
        return data.users[index];
      }
      return null;
    },
    delete: (id) => {
      const index = data.users.findIndex(user => user.id === id);
      if (index !== -1) {
        const deleted = data.users.splice(index, 1)[0];
        saveData(data);
        return deleted;
      }
      return null;
    }
  },
  verificationCodes: {
    getValid: (phone, code) => {
      const now = new Date();
      return data.verificationCodes.find(vc => 
        vc.phone === phone && 
        vc.code === code && 
        vc.used === 0 && 
        new Date(vc.expires_at) > now
      );
    },
    insert: (vc) => {
      data.verificationCodes.push(vc);
      saveData(data);
      return vc;
    },
    markUsed: (id) => {
      const index = data.verificationCodes.findIndex(vc => vc.id === id);
      if (index !== -1) {
        data.verificationCodes[index].used = 1;
        saveData(data);
      }
    }
  },
  wechatSessions: {
    get: (id) => data.wechatSessions.find(session => session.id === id),
    insert: (session) => {
      data.wechatSessions.push(session);
      saveData(data);
      return session;
    },
    update: (id, updates) => {
      const index = data.wechatSessions.findIndex(session => session.id === id);
      if (index !== -1) {
        data.wechatSessions[index] = { ...data.wechatSessions[index], ...updates };
        saveData(data);
        return data.wechatSessions[index];
      }
      return null;
    }
  }
};

module.exports = db;
