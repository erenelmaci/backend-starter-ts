import { Model, Document, Types } from 'mongoose';
import { IBaseDocument } from './BaseModel';

export interface ListResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export class BaseController<T extends IBaseDocument> {
  constructor(private model: Model<T>) {}

  public async list(query: any = {}, options: any = {}): Promise<ListResponse<T>> {
    const { page = 1, limit = 10, search } = query;
    const skip = (Number(page) - 1) * Number(limit);

    let filter: any = { isExists: true };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await this.model
      .find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await this.model.countDocuments(filter);

    return {
      items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    };
  }

  public async create(data: Partial<T>): Promise<T> {
    return this.model.create({
      ...data,
      isExists: true,
      canUpdate: true,
      canDelete: true,
    });
  }

  public async read(filter: any): Promise<T | null> {
    return this.model.findOne({ ...filter, isExists: true });
  }

  public async update(id: string, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
  }

  public async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndUpdate(
      id,
      {
        isExists: false,
        deletedAt: new Date(),
      },
      { new: true },
    );
  }
}
