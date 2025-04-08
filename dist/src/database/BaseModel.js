"use strict";
/* *******************************************************
 * NODEJS PROJECT © 2024 - ITOPIATECH.COM.TR *
 ******************************************************* */
Object.defineProperty(exports, "__esModule", { value: true });
const { Schema, Model, models, model } = require('./mongoose');
class BaseModel {
    constructor() {
        this.ObjectId = Schema.Types.ObjectId;
    }
    run() {
        this.Model = models[this.name] || model(this.name, this.ModelSchema());
        return this;
    }
    ModelSchema() {
        const schema = new Schema(Object.assign(Object.assign({}, this.fields), { notes: { type: String, default: null }, sortNumber: { type: Number, default: 0 }, isActive: { type: Boolean, default: true }, createdByUserId: { type: this.ObjectId, default: null }, updatedByUserId: { type: this.ObjectId, default: null }, deletedByUserId: { type: this.ObjectId, default: null }, canUpdate: { type: Boolean, default: true }, canDelete: { type: Boolean, default: true }, isExists: { type: Boolean, default: true } }), {
            collection: this.table,
            timestamps: {
                createdAt: 'createdAtDate',
                updatedAt: 'updatedAtDate',
                deletedAt: 'deletedAtDate',
            },
            id: false,
        });
        if (this.indexes && Array.isArray(this.indexes)) {
            this.indexes.forEach(index => {
                schema.index(index.fields, index.options);
            });
        }
        return schema;
    }
}
/* -------------------------------------------------- */
exports.default = BaseModel;
