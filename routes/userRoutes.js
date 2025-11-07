import { getUser, login, logout, signup } from "../controllers/userController";

const router = express.Router();

router.get("/user", getUser);

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

export default router;
