import {Document} from 'mongoose';
interface User extends Document {
  username: string;
  email: string;
  password: string;
}

interface UserTest {
  id?: string;
  username?: string; // returned from graphql is snake_case
  userName?: string; // graphql variables are camelCase
  email?: string;
  password?: string;
  token?: string;
}

interface UserIdWithToken {
  id: string;
  token: string;
  role: 'admin' | 'user';
}

export {User, UserTest, UserIdWithToken};
