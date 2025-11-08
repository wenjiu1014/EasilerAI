const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

class Database {
    constructor() {
        this.db = null;
        this.dbPath = path.join(process.env.APPDATA || process.env.HOME, 'EasilerAI', 'sources.db');
        this.dbDir = path.dirname(this.dbPath);
    }

    // 初始化数据库
  async init() {
    // 创建目录
    if (!fs.existsSync(this.dbDir)) {
      fs.mkdirSync(this.dbDir, { recursive: true });
    }

    // 加载 sql.js
    const SQL = await initSqlJs();

    // 如果数据库文件存在，加载它；否则创建新数据库
    if (fs.existsSync(this.dbPath)) {
      const data = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(data);
    } else {
      this.db = new SQL.Database();
      this.createTables(); // 创建表
      this.saveDatabase();
    }
  }

  // 创建表
  createTables() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS sources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        url TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 插入默认数据
    this.db.run(`
      INSERT OR IGNORE INTO sources (name, url) VALUES
      ('ChatGPT', 'https://www.chatgpt.com'),
      ('腾讯元宝', 'https://yuanbao.tencent.com/chat/naQivTmsDa'),
      ('通义千问', 'https://tongyi.aliyun.com/qianwen/')
    `);
  }

  // 保存数据库到文件
  saveDatabase() {
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this.dbPath, buffer);
  }

  // 获取所有sources
  getAllSources() {
    try {
      const result = this.db.exec(`SELECT id, name, url FROM sources ORDER BY created_at`);
      if (!result || result.length === 0) {
        console.log('没有查询结果');
        return [];
      }
      
      const columns = result[0].columns;
      const values = result[0].values || [];
      
      if (values.length === 0) {
        console.log('数据库中没有sources');
        return [];
      }
      
      return values.map(row => {
        return {
          id: row[columns.indexOf('id')],
          name: row[columns.indexOf('name')],
          url: row[columns.indexOf('url')]
        };
      });
    } catch (error) {
      console.error('查询sources出错:', error);
      return [];
    }
  }

  // 添加source
  addSource(name, url) {
    try {
      this.db.run(
        `INSERT INTO sources (name, url) VALUES (?, ?)`,
        [name, url]
      );
      this.saveDatabase();
      return this.getAllSources();
    } catch (error) {
      throw new Error(`添加失败: ${error.message}`);
    }
  }

  // 删除source
  deleteSource(id) {
    try {
      this.db.run(`DELETE FROM sources WHERE id = ?`, [id]);
      this.saveDatabase();
      return this.getAllSources();
    } catch (error) {
      throw new Error(`删除失败: ${error.message}`);
    }
  }

  // 更新source
  updateSource(id, name, url) {
    try {
      this.db.run(
        `UPDATE sources SET name = ?, url = ? WHERE id = ?`,
        [name, url, id]
      );
      this.saveDatabase();
      return this.getAllSources();
    } catch (error) {
      throw new Error(`更新失败: ${error.message}`);
    }
  }
}

module.exports = Database;