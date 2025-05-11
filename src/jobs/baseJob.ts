// class BaseCleanupJob {
//   constructor({ model, loginField = null, stages = {}, deletedAtBased = false, enable = true }) {
//     this.model = model
//     this.loginField = loginField
//     this.stages = stages
//     this.deletedAtBased = deletedAtBased
//     this.enable = enable
//   }

//   async run(now = Date.now()) {
//     if (!this.enable) return

//     const ops = []

//     if (this.loginField) {
//       if (this.stages.markAsInactive) {
//         ops.push({
//           filter: {
//             [this.loginField]: { $lte: new Date(now - this.stages.markAsInactive) },
//             isExists: true,
//           },
//           update: { isExists: false },
//         })
//       }

//       if (this.stages.softDelete) {
//         ops.push({
//           filter: {
//             [this.loginField]: { $lte: new Date(now - this.stages.softDelete) },
//             isExists: false,
//             deletedAt: { $exists: false },
//           },
//           update: { deletedAt: new Date() },
//         })
//       }

//       if (this.stages.hardDelete) {
//         ops.push({
//           filter: {
//             [this.loginField]: { $lte: new Date(now - this.stages.hardDelete) },
//             deletedAt: { $exists: true },
//           },
//           delete: true,
//         })
//       }
//     }

//     if (this.deletedAtBased) {
//       if (this.stages.hardDelete) {
//         ops.push({
//           filter: {
//             deletedAt: { $lte: new Date(now - this.stages.hardDelete) },
//           },
//           delete: true,
//         })
//       }
//     }

//     for (const op of ops) {
//       if (op.delete) {
//         await this.model.deleteMany(op.filter)
//       } else {
//         await this.model.updateMany(op.filter, { $set: op.update })
//       }
//     }
//   }
// }

// export default BaseCleanupJob
