/* *******************************************************
 * NODEJS PROJECT © 2024 - BURSAYAZİLİMEVİ.COM *
 ******************************************************* */

import mongoose, { Schema, Model, Document } from 'mongoose';

/* -------------------------------------------------- */

// Index tanımı için interface
interface ModelIndex {
  fields: Record<string, any>;
  options?: Record<string, any>;
}

// Base document interface
export interface IBaseDocument extends Document {
  notes?: string;
  sortNumber?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdByUserId: mongoose.Types.ObjectId | string;
  updatedByUserId?: mongoose.Types.ObjectId | string;
  deletedByUserId?: mongoose.Types.ObjectId | string;
  canUpdate: boolean;
  canDelete: boolean;
  isExists: boolean;
}

abstract class BaseModel<T extends IBaseDocument> {
  // ------------------------------
  // MODEL:
  // ------------------------------
  protected ObjectId: typeof Schema.Types.ObjectId;
  public Model!: Model<T>;
  protected abstract name: string;
  protected abstract table: string;
  protected abstract fields: Record<string, any>;
  protected indexes?: ModelIndex[];
  protected searchs?: string[];

  constructor() {
    this.ObjectId = Schema.Types.ObjectId;
    // this.initModel();
  }

  public initModel(): void {
    const schema = this.ModelSchema();
    this.Model = (mongoose.models[this.name] as Model<T>) || mongoose.model<T>(this.name, schema);
  }

  protected ModelSchema(): Schema {
    const schema = new Schema(
      {
        ...this.fields,
        notes: { type: String, default: null },
        sortNumber: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        createdByUserId: { type: this.ObjectId, default: null },
        updatedByUserId: { type: this.ObjectId, default: null },
        deletedByUserId: { type: this.ObjectId, default: null },
        canUpdate: { type: Boolean, default: true },
        canDelete: { type: Boolean, default: true },
        isExists: { type: Boolean, default: true },
      },
      {
        collection: this.table,
        timestamps: true,
        id: false,
      },
    );

    if (this.indexes && Array.isArray(this.indexes)) {
      this.indexes.forEach(index => {
        schema.index(index.fields, index.options);
      });
    }

    return schema;
  }
}

/* -------------------------------------------------- */

export default BaseModel;
