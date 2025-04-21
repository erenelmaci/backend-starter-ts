import { Model } from 'mongoose';
import { IBaseDocument } from './Model';

export interface ListResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const db = {
  list: async <T extends IBaseDocument>(
    model: Model<T>,
    query: any = {},
    options: any = {},
  ): Promise<ListResponse<T>> => {
    const { page = 1, limit = 10, search } = query;
    const skip = (Number(page) - 1) * Number(limit);

    let filter: any = { isExists: true, isActive: true, deletedAt: null };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await model.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });

    const total = await model.countDocuments(filter);

    return {
      items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    };
  },

  create: async <T extends IBaseDocument>(model: Model<T>, data: Partial<T>): Promise<T> => {
    return model.create({
      ...data,
      createdAt: new Date(),
      isExists: true,
      canUpdate: true,
      canDelete: true,
    });
  },

  read: async <T extends IBaseDocument>(model: Model<T>, filter: any): Promise<T | null> => {
    return model.findOne({ ...filter, isExists: true });
  },

  update: async <T extends IBaseDocument>(
    model: Model<T>,
    id: string,
    data: Partial<T>,
  ): Promise<T | null> => {
    return model.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
  },

  remove: async <T extends IBaseDocument>(model: Model<T>, id: string): Promise<T | null> => {
    return model.findByIdAndUpdate(
      id,
      {
        isExists: false,
        deletedAt: new Date(),
      },
      { new: true },
    );
  },
};
