import * as bcrypt from 'bcryptjs';
import { IPassword } from '../interfaces/Password/IPassword';

export class Password implements IPassword {
  async hash(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async compare(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  compareSync(password: string, hash: string) {
    return bcrypt.compareSync(password, hash);
  }

  hashSync(password: string) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }
}
