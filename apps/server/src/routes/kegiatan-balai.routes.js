import { Hono } from "hono";

import {
	getKegiatanBalai,
	createKegiatanBalai,
	updateKegiatanBalai,
	deleteKegiatanBalai,
} from "../controllers/kegiatan-balai.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const kegiatanBalaiRoute = new Hono();
kegiatanBalaiRoute.use("*", authMiddleware);
kegiatanBalaiRoute.get("/", getKegiatanBalai);
kegiatanBalaiRoute.post("/", roleMiddleware("admin"), createKegiatanBalai);
kegiatanBalaiRoute.put("/:id", roleMiddleware("admin"), updateKegiatanBalai);
kegiatanBalaiRoute.delete("/:id", roleMiddleware("admin"), deleteKegiatanBalai);

export default kegiatanBalaiRoute;
