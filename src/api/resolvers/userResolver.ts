import {GraphQLError} from 'graphql';
import {Cat} from '../../interfaces/Cat';
import LoginMessageResponse from '../../interfaces/LoginMessageResponse';
import {User, UserIdWithToken} from '../../interfaces/User';
// TODO: create resolvers based on user.graphql
// note: when updating or deleting a user don't send id to the auth server, it will get it from the token
// note2: when updating or deleting a user as admin, you need to check if the user is an admin by checking the role from the user object

export default {
  Cat: {
    owner: async (parent: Cat) => {
      const response = await fetch(
        `${process.env.AUTH_URL}/users/${parent.owner}`
      );
      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
      }
      const user: User = await response.json();
      return user;
    },
  },
  Query: {
    users: async () => {
      const response = await fetch(`${process.env.AUTH_URL}/users`);
      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
      }
      const users: User[] = await response.json();
      return users;
    },
    userById: async (_parent: unknown, args: {id: string}) => {
      const response = await fetch(`${process.env.AUTH_URL}/users/${args.id}`);
      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
      }
      const user: User = await response.json();
      return user;
    },
    checkToken: async (
      _parent: unknown,
      _args: unknown,
      user: UserIdWithToken
    ) => {
      const response = await fetch(`${process.env.AUTH_URL}/users/token`, {
        headers: {Authorization: `Bearer ${user.token}`},
      });
      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
      }
      const userFromToken: UserIdWithToken = await response.json();
      return userFromToken;
    },
  },
  Mutation: {
    login: async (
      _parent: unknown,
      args: {credentials: {email: string; password: string}}
    ) => {
      const response = await fetch(`${process.env.AUTH_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args.credentials),
      });
      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
      }
      const user = (await response.json()) as LoginMessageResponse;
      return user;
    },
    register: async (_parent: unknown, args: {user: User}) => {
      const response = await fetch(`${process.env.AUTH_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args.user),
      });

      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
      }
      const user = (await response.json()) as LoginMessageResponse;
      return user;
    },
    updateUser: async (
      _parent: unknown,
      args: {user: User},
      user: UserIdWithToken
    ) => {
      if (!user.token) {
        throw new GraphQLError('Unauthorized', {
          extensions: {
            code: 'UNAUTHORIZED',
          },
        });
      }

      const response = await fetch(`${process.env.AUTH_URL}/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(args.user),
      });

      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
      }

      const updatedUser = (await response.json()) as LoginMessageResponse;
      return updatedUser;
    },
    deleteUser: async (
      _parent: unknown,
      _args: unknown,
      user: UserIdWithToken
    ) => {
      if (!user.token) {
        throw new GraphQLError('Unauthorized', {
          extensions: {
            code: 'UNAUTHORIZED',
          },
        });
      }

      const response = await fetch(`${process.env.AUTH_URL}/users/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
      }

      const deletedUser = (await response.json()) as LoginMessageResponse;
      return deletedUser;
    },
    updateUserAsAdmin: async (
      _parent: unknown,
      args: {user: User; id: string},
      user: UserIdWithToken
    ) => {
      if (!user.token) {
        throw new GraphQLError('Unauthorized', {
          extensions: {
            code: 'UNAUTHORIZED',
          },
        });
      }

      if (user.role !== 'admin') {
        throw new GraphQLError('Unauthorized', {
          extensions: {
            code: 'UNAUTHORIZED',
          },
        });
      }

      const response = await fetch(`${process.env.AUTH_URL}/users/${args.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(args.user),
      });
      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
      }

      const updatedUser = (await response.json()) as LoginMessageResponse;
      return updatedUser;
    },
    deleteUserAsAdmin: async (
      _parent: unknown,
      args: {id: string},
      user: UserIdWithToken
    ) => {
      if (!user.token) {
        throw new GraphQLError('Unauthorized', {
          extensions: {
            code: 'UNAUTHORIZED',
          },
        });
      }

      if (user.role !== 'admin') {
        throw new GraphQLError('Unauthorized', {
          extensions: {
            code: 'UNAUTHORIZED',
          },
        });
      }

      const response = await fetch(`${process.env.AUTH_URL}/users/${args.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new GraphQLError(response.statusText, {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
      }

      const deletedUser = (await response.json()) as LoginMessageResponse;
      return deletedUser;
    },
  },
};
