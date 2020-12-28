import fse from 'fs-extra';
import path from 'path';
import sq3 from 'sqlite3';
import logger from './logger';
import { docDir } from './settings';
// 将数据存至系统用户目录，防止用户误删程序
export const dbPath = path.join(docDir, 'data.sqlite3');
fse.ensureFileSync(dbPath);

const sqlite3 = sq3.verbose();
const db = new sqlite3.Database(dbPath);
db.serialize(() => {
  /**
   * 列表 TABLE_PRINTLIST
   * serialNumber 流水号
   * materialCode 物料编码
   * create_time  DATE
   * lot LOT
   * oneSupCode  一级供方代码
   * towSupCode  二级供方代码
   * brandCode  品牌代码
   * count  数量
   * supplier 供方
   * description 物料描述
   * specification 规格书型号
   * remark 备注
   * print 打印次数
   */
  db.run(`CREATE TABLE TABLE_PRINTLIST(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    serialNumber VARCHAR(255) NOT NULL,
    materialCode VARCHAR(255) NOT NULL DEFAULT '',
    create_time VARCHAR(255) NOT NULL,
    lot VARCHAR(255),
    oneSupCode VARCHAR(255) NOT NULL DEFAULT '',
    towSupCode VARCHAR(255) NOT NULL DEFAULT '',
    brandCode VARCHAR(255) NOT NULL DEFAULT '',
    count INT NOT NULL DEFAULT 0,
    supplier VARCHAR(255) NOT NULL NOT NULL DEFAULT '',
    description VARCHAR(255) NOT NULL NOT NULL DEFAULT '',
    specification VARCHAR(255) NOT NULL,
    remark VARCHAR(255) NOT NULL,
    print INT NOT NULL DEFAULT ''
    )`, err => {
    logger(err);
  });
});

export default db;
