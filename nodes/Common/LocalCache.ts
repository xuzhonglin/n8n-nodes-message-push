import sqlite3 from 'sqlite3';

// 定义缓存项接口
class LocalCache {
	private db: sqlite3.Database;
	private dbName: string = 'localCache.db'; // 数据库文件名

	constructor() {
		// 打开或创建数据库
		this.db = new sqlite3.Database(this.dbName, (err) => {
			if (err) {
				console.error('Error opening database', err);
			} else {
				console.log('Database opened');
				this.initDatabase();
			}
		});
	}

	// 初始化数据库
	private initDatabase(): void {
		this.db.run(
			`CREATE TABLE IF NOT EXISTS cache
			 (
				 key    TEXT PRIMARY KEY,
				 value  TEXT,
				 expiry REAL
			 )`
		);
	}

	// 设置缓存项
	public set(key: string, value: any, ttl: number = 3600): void {
		const expiry = this.getExpiryTime(ttl);
		this.db.run(
			`INSERT INTO cache (key, value, expiry)
			 VALUES (?, ?, ?)
			 ON CONFLICT(key) DO UPDATE SET value=excluded.value,
																			expiry=excluded.expiry`,
			[key, JSON.stringify(value), expiry],
			(err) => {
				if (err) {
					console.error('Error setting cache', err);
				}
			}
		);
	}

	// 获取缓存项
	public get(key: string): Promise<any> {
		return new Promise((resolve, reject) => {
			this.db.get(
				'SELECT value, expiry FROM cache WHERE key = ? AND (expiry > ? OR expiry IS NULL)',
				[key, Date.now()],
				(err, row: any) => {
					console.log(row)
					if (err) {
						reject(err);
					} else if (!row) {
						resolve(null); // 缓存不存在或已过期
					} else {
						try {
							resolve(JSON.parse(row.value));
						} catch (e) {
							reject(e);
						}
					}
				}
			);
		});
	}

	// 删除缓存项
	public delete(key: string): void {
		this.db.run(`DELETE
								 FROM cache
								 WHERE key = ?`, [key], (err) => {
			if (err) {
				console.error('Error deleting cache', err);
			}
		});
	}

	// 清除过期缓存
	public clearExpired(): void {
		this.db.run(`DELETE
								 FROM cache
								 WHERE expiry <= ?`, [Date.now()], (err) => {
			if (err) {
				console.error('Error clearing expired cache', err);
			}
		});
	}

	// 获取过期时间戳
	private getExpiryTime(ttl: number): number {
		return Date.now() + ttl * 1000;
	}

	// 关闭数据库连接
	public close(): void {
		this.db.close((err) => {
			if (err) {
				console.error('Error closing database', err);
			} else {
				console.log('Database connection closed');
			}
		});
	}
}

export default LocalCache;
