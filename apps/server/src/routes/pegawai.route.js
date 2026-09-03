import { Hono } from "hono";

import {
	getPegawai,
	createPegawai,
	updatePegawai,
	deletePegawai,
} from "../controllers/pegawai.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const pegawaiRoute = new Hono();

pegawaiRoute.use("*", authMiddleware);

pegawaiRoute.get("/", getPegawai);
pegawaiRoute.use("*", roleMiddleware("admin", "operator"));
pegawaiRoute.post("/", createPegawai);
pegawaiRoute.put("/:id", updatePegawai);
pegawaiRoute.delete("/:id", deletePegawai);

export default pegawaiRoute;
