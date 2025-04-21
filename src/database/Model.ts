/* *******************************************************
 * NODEJS PROJECT © 2024 - BURSAYAZİLİMEVİ.COM *
 ******************************************************* */

import mongoose, { Schema, model, models } from 'mongoose';

interface ModelIndex {
  fields: Record<string, any>;
  options?: Record<string, any>;
}

// Base document interface
export interface IBaseDocument extends mongoose.Document {
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

export class Model {
  // ------------------------------
  // MODEL:
  // ------------------------------
  protected ObjectId: typeof Schema.Types.ObjectId;
  public Model!: mongoose.Model<IBaseDocument>;
  protected name: string = '';
  protected table: string = '';
  protected searchs: string[] = [];
  protected fields: Record<string, any> = {};
  protected indexes?: ModelIndex[];

  constructor() {
    this.ObjectId = Schema.Types.ObjectId;
  }

  public run() {
    this.Model = models[this.name] || model(this.name, this.ModelSchema());
    return this;
  }

  protected ModelSchema() {
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
