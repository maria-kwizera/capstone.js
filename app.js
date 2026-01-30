const fs = require('fs').promises;
const path = require('path');

const dataPath = path.join(__dirname, 'data.json');

async function readData() {
  try {
    const raw = await fs.readFile(dataPath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeData(list) {
  await fs.writeFile(dataPath, JSON.stringify(list, null, 2), 'utf8');
}

async function getProcurements() {
  return await readData();
}

async function addProcurement(record) {
  const list = await readData();
  list.push(record);
  await writeData(list);
  return record;
}

module.exports = { getProcurements, addProcurement };
