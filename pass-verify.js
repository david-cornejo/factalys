const bcrypt = require('bcrypt');

async function verifyPassword() {
  const myPassword = 'root';
  const myPasswordHash =
    '$2b$10$KzcALDWijybAFxBGG9oTbu.Zg7MxJuDOZaLRKMx6xg/gP32Bqzkcq';
  const isMach = await bcrypt.compare(myPassword, myPasswordHash);
  console.log(isMach);
}

verifyPassword();
