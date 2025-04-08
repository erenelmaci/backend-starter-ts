/* *******************************************************
 * NODEJS PROJECT © 2024 - ITOPIATECH.COM.TR *
 ******************************************************* */

const { Schema, Model, models, model } = require('./mongoose');

/* -------------------------------------------------- */

// Index tanımı için interface
interface ModelIndex {
  fields: Record<string, any>;
  options?: Record<string, any>;
}

class BaseModel {
  // ------------------------------
  // MODEL:
  // ------------------------------
  protected ObjectId: typeof Schema.Types.ObjectId;
  protected Model: typeof Model;
  protected name?: string;
  protected table?: string;
  protected fields?: Record<string, any>;
  protected indexes?: ModelIndex[];

  constructor() {
    this.ObjectId = Schema.Types.ObjectId;
  }

  run(): this {
    this.Model = models[this.name as string] || model(this.name as string, this.ModelSchema());
    return this;
  }

  protected ModelSchema(): typeof Schema {
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
        timestamps: {
          createdAt: 'createdAtDate',
          updatedAt: 'updatedAtDate',
          deletedAt: 'deletedAtDate',
        },
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
