import { Model, SortOrder } from 'mongoose'
import { IBaseDocument } from './Model'
import { Request } from 'express'

export interface ListResponse<T> {
  error: boolean
  method: string
  info: {
    filter: any
    select: string | undefined
    sort: {
      [key: string]: SortOrder
    }
    skip: number
    limit: number
    page: number
    pages:
      | {
          previous: number | boolean
          current: number
          next: number | boolean
          total: number
        }
      | boolean
    totalRecords: number
    url: string
  }
  data: T[]
}

export const db = {
  list: async <T extends IBaseDocument>(
    model: Model<T>,
    req: Request,
  ): Promise<ListResponse<T>> => {
    // ------------------------------
    //! PARSE QUERY PARAMETERS
    // ------------------------------
    const queryParams = req.query
    const pageRaw = queryParams.page
    const limitRaw = queryParams.limit
    const page = Math.max(1, Number(pageRaw) || 1)
    const limit = Math.max(1, Number(limitRaw) || 20)

    console.log('Query Params:', { page, limit, queryParams })

    // ------------------------------
    //! FILTER: Supports operators like gt, gte, lt, lte, ne, eq, regex, in, nin
    // ------------------------------
    const filter: any = {}
    Object.keys(queryParams).forEach(key => {
      if (key.startsWith('filter[')) {
        const field = key.replace('filter[', '').replace(']', '')
        const value = queryParams[key]

        if (typeof value === 'string' && value.includes(':')) {
          const [operator, rawVal] = value.split(':')
          switch (operator) {
            case 'gt':
              filter[field] = { $gt: isNaN(Number(rawVal)) ? rawVal : Number(rawVal) }
              break
            case 'gte':
              filter[field] = { $gte: isNaN(Number(rawVal)) ? rawVal : Number(rawVal) }
              break
            case 'lt':
              filter[field] = { $lt: isNaN(Number(rawVal)) ? rawVal : Number(rawVal) }
              break
            case 'lte':
              filter[field] = { $lte: isNaN(Number(rawVal)) ? rawVal : Number(rawVal) }
              break
            case 'ne':
              filter[field] = { $ne: isNaN(Number(rawVal)) ? rawVal : Number(rawVal) }
              break
            case 'eq':
              filter[field] = isNaN(Number(rawVal)) ? rawVal : Number(rawVal)
              break
            case 'regex':
              filter[field] = { $regex: rawVal, $options: 'i' }
              break
            case 'in':
              filter[field] = { $in: rawVal.split(',') }
              break
            case 'nin':
              filter[field] = { $nin: rawVal.split(',') }
              break
            default:
              filter[field] = isNaN(Number(value)) ? value : Number(value)
          }
        } else {
          filter[field] = isNaN(Number(value)) ? value : Number(value)
        }
      }
    })

    // ------------------------------
    //! FILTER DEFAULTS: Only active and existing records if no filter is provided
    // ------------------------------
    const queryFilter =
      Object.keys(filter).length > 0 ? filter : { isExists: true, isActive: true, deletedAt: null }

    // ------------------------------
    //! SORT: Supports sort[field]=asc|desc
    // ------------------------------
    const sort: any = {}
    Object.keys(queryParams).forEach(key => {
      if (key.startsWith('sort[')) {
        const field = key.replace('sort[', '').replace(']', '')
        const value = queryParams[key]
        sort[field] = value === 'desc' ? -1 : 1
      }
    })
    const sortOptions = Object.keys(sort).length > 0 ? sort : { createdAt: -1 }

    // ------------------------------
    //! SELECT: Fields to return
    // ------------------------------
    const selectFields = queryParams.select ? String(queryParams.select) : undefined

    // ------------------------------
    //! DATABASE QUERY: Count first to determine pagination
    // ------------------------------
    const total = await model.countDocuments(queryFilter)

    // ------------------------------
    //! PAGINATION: Calculate based on total records
    // ------------------------------
    const limitNumber = Math.max(1, limit)
    const totalPages = limitNumber > 0 ? Math.ceil(total / limitNumber) : 1
    const currentPage = Math.min(page, totalPages > 0 ? totalPages : 1)
    const skip = total > 0 ? (currentPage - 1) * limitNumber : 0

    console.log('Pagination:', { currentPage, totalPages, skip, limitNumber })

    // ------------------------------
    //! DATABASE QUERY: Find with pagination
    // ------------------------------
    const items = await model
      .find(queryFilter, selectFields)
      .populate((model as any).listJoins || [])
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber)

    // ------------------------------
    //! PAGINATION DETAILS
    // ------------------------------
    let pages: ListResponse<T>['info']['pages']
    if (limitNumber > 0 && total > limitNumber) {
      pages = {
        previous: currentPage > 1 ? currentPage - 1 : false,
        current: currentPage,
        next: currentPage < totalPages ? currentPage + 1 : false,
        total: totalPages,
      }
    } else {
      pages = false
    }

    console.log(currentPage)

    // ------------------------------
    //! URL GENERATION: Rebuild query string for info
    // ------------------------------
    const urlParams = new URLSearchParams()
    urlParams.append('page', String(pageRaw || 1))
    if (limitRaw && Number(limitRaw) !== 20) urlParams.append('limit', String(limitRaw))

    //? Add filter parameters
    Object.keys(filter).forEach(key => {
      if (filter[key] !== undefined) {
        urlParams.append(`filter[${key}]`, String(filter[key]))
      }
    })

    //? Add sort parameters
    Object.keys(sort).forEach(key => {
      if (sort[key] !== undefined) {
        urlParams.append(`sort[${key}]`, sort[key] === -1 ? 'desc' : 'asc')
      }
    })

    //? Add select if exists
    if (queryParams.select) urlParams.append('select', String(queryParams.select))

    const queryString = urlParams.toString()
    const url = req.originalUrl.split('?')[0]

    // ------------------------------
    //! RESPONSE
    // ------------------------------
    return {
      error: false,
      method: req.method || 'GET',
      info: {
        filter: queryFilter,
        select: selectFields,
        sort: sortOptions,
        skip,
        limit: limitNumber,
        page: currentPage,
        pages,
        totalRecords: total,
        url: queryString ? `${url}?${queryString}` : url,
      },
      data: items,
    }
  },

  create: async <T extends IBaseDocument>(model: Model<T>, data: Partial<T>): Promise<any> => {
    const createdData = await model.create({
      ...data,
      createdAt: new Date(),
      isExists: true,
      canUpdate: true,
      canDelete: true,
    })
    return {
      error: false,
      message: 'Created successfully',
      data: createdData.toObject(),
      timestamp: new Date().toISOString(),
    }
  },

  read: async <T extends IBaseDocument>(model: Model<T>, filter: any): Promise<T | null> => {
    return model.findOne({ ...filter }).populate((model as any).listJoins)
  },

  update: async <T extends IBaseDocument>(
    model: Model<T>,
    id: string,
    data: Partial<T>,
  ): Promise<T | null> => {
    return model.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true })
  },

  remove: async <T extends IBaseDocument>(model: Model<T>, id: string): Promise<any> => {
    const removedData = await model.findByIdAndUpdate(
      id,
      {
        isExists: false,
        deletedAt: new Date(),
      },
      { new: true },
    )
    return {
      error: false,
      message: 'Record removed successfully',
      data: removedData ? removedData.toObject() : null,
      timestamp: new Date().toISOString(),
    }
  },
}
