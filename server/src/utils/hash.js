import bcrypt from 'bcrypt';

const password = 'adminbpmptp344';

const hash = await bcrypt.hash(password, 10);

console.log(hash)