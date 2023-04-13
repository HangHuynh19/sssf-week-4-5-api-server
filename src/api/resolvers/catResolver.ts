import {GraphQLError} from 'graphql';
import {Cat} from '../../interfaces/Cat';
import {LocationInput} from '../../interfaces/Location';
import {User, UserIdWithToken} from '../../interfaces/User';
import rectangleBounds from '../../utils/rectangleBounds';
import catModel from '../models/catModel';
import {Types} from 'mongoose';

// TODO: create resolvers based on cat.graphql
// note: when updating or deleting a cat, you need to check if the user is the owner of the cat
// note2: when updating or deleting a cat as admin, you need to check if the user is an admin by checking the role from the user object

export default {
  Query: {
    cats: async () => {
      const cats = await catModel.find();
      return cats;
    },
    catById: async (_parent: unknown, args: {id: string}) => {
      const cats = await catModel.find({_id: new Types.ObjectId(args.id)});

      if (!cats) {
        throw new GraphQLError('Cat not found', {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
      }
      return cats[0];
    },
    catsByArea: async (_parent: unknown, args: LocationInput) => {
      const bounds = rectangleBounds(args.topRight, args.bottomLeft);

      return await catModel.find({
        location: {
          $geoWithin: {
            $geometry: bounds,
          },
        },
      });
    },
    catsByOwner: async (_parent: unknown, args: {ownerId: string}) => {
      return await catModel.find({owner: args.ownerId});
    },
  },
  Mutation: {
    createCat: async (_parent: unknown, args: Cat, user: UserIdWithToken) => {
      if (!user.token) {
        throw new GraphQLError('Unauthorized', {
          extensions: {
            code: 'UNAUTHORIZED',
          },
        });
      }

      const cat = new catModel({
        ...args,
        owner: new Types.ObjectId(user.id),
      });
      return await cat.save();
    },
    updateCat: async (_parent: unknown, args: Cat, user: UserIdWithToken) => {
      const cat = await catModel.findById(args.id);
      if (!cat) {
        throw new GraphQLError('Cat not found', {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
      }

      if (cat.owner._id.toString() !== user.id) {
        throw new GraphQLError('Unauthorized', {
          extensions: {
            code: 'UNAUTHORIZED',
          },
        });
      }

      return await catModel.findByIdAndUpdate(args.id, args, {new: true});
    },
    deleteCat: async (
      _parent: unknown,
      args: {id: string},
      user: UserIdWithToken
    ) => {
      const cat = await catModel.findById(args.id);
      if (!cat) {
        throw new GraphQLError('Cat not found', {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
      }
      if (cat.owner._id.toString() !== user.id) {
        throw new GraphQLError('Unauthorized', {
          extensions: {
            code: 'UNAUTHORIZED',
          },
        });
      }
      return await catModel.findByIdAndDelete(args.id);
    },
    updateCatAsAdmin: async (
      _parent: unknown,
      args: Cat,
      user: UserIdWithToken
    ) => {
      if (user.role !== 'admin') {
        throw new GraphQLError('Unauthorized', {
          extensions: {
            code: 'UNAUTHORIZED',
          },
        });
      }
      return await catModel.findByIdAndUpdate(args.id, args, {new: true});
    },
    deleteCatAsAdmin: async (
      _parent: unknown,
      args: {id: string},
      user: UserIdWithToken
    ) => {
      if (user.role !== 'admin') {
        throw new GraphQLError('Unauthorized', {
          extensions: {
            code: 'UNAUTHORIZED',
          },
        });
      }
      return await catModel.findByIdAndDelete(args.id);
    },
  },
};
