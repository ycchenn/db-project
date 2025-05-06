import mysqlConnectionPool from "../lib/mysql.js";

function get999Students(year, dep) {
  const ret = [];
  for (let i = 1; i < 999; i++) {
    let id = i < 10 ? `00${i}` : i < 100 ? `0${i}` : `${i}`;
    ret.push([
      `${year}${dep}${id}@nccu.edu.tw`,
      `${year}${dep}${id}`,
      `${year}${dep}${id}`,
    ]);
  }
  return ret;
}

async function insertData() {
  try {
    const data = [];
    for (let y = 100; y < 114; y++) {
      data.push(...get999Students(y, 356));
    }

    const connection = await mysqlConnectionPool.getConnection();
    const sql = "INSERT INTO `User` (`Email`, `Password`, `Name`) VALUES ?";
    await connection.query(sql, [data]);
    console.log("INSERT SUCCEED");
  } catch (error) {
    console.error("Error inserting data:", error);
  }
}

insertData();
