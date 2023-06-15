import { Injectable, NestMiddleware } from "@nestjs/common";
import { UserRole } from "src/users/schema/user.schema";

@Injectable()
export class AdminMiddleware implements NestMiddleware {
  use(req: any, res: any, next: (error?: any) => void) {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthenticated" })
    }

    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Forbidden" })
    }

    return next();
  }
}