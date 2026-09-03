import bcrypt from "bcrypt";

// adminbpmptp344
// opr123bpmptp
// staff1
const password = "staff1";

const hash = await bcrypt.hash(password, 10);

console.log(hash);
