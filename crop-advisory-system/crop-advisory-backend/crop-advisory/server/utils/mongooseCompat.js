const { Model, Op } = require("sequelize");

function translateMongoQuery(query) {
  if (query === null || query === undefined) return query;
  if (Array.isArray(query)) {
    return query.map(translateMongoQuery);
  }
  if (typeof query !== "object" || query instanceof Date || query instanceof RegExp) {
    return query;
  }

  const result = {};
  for (const [key, value] of Object.entries(query)) {
    let newKey = key;
    let newValue = value;

    // Convert keys
    if (key === "$or") {
      newKey = Op.or;
      newValue = translateMongoQuery(value);
    } else if (key === "$and") {
      newKey = Op.and;
      newValue = translateMongoQuery(value);
    } else if (key === "$in") {
      newKey = Op.in;
      newValue = translateMongoQuery(value);
    } else if (key === "$nin") {
      newKey = Op.notIn;
      newValue = translateMongoQuery(value);
    } else if (key === "$eq") {
      newKey = Op.eq;
      newValue = translateMongoQuery(value);
    } else if (key === "$ne") {
      newKey = Op.ne;
      newValue = translateMongoQuery(value);
    } else if (key === "$gt") {
      newKey = Op.gt;
      newValue = translateMongoQuery(value);
    } else if (key === "$gte") {
      newKey = Op.gte;
      newValue = translateMongoQuery(value);
    } else if (key === "$lt") {
      newKey = Op.lt;
      newValue = translateMongoQuery(value);
    } else if (key === "$lte") {
      newKey = Op.lte;
      newValue = translateMongoQuery(value);
    }

    // Special handling for { field: { $regex: '...', $options: 'i' } } or RegExp instances
    if (value && typeof value === "object" && !(value instanceof Date) && !(value instanceof RegExp)) {
      if (value.hasOwnProperty("$regex")) {
        let patternStr = "";
        if (value.$regex instanceof RegExp) {
          patternStr = value.$regex.source;
        } else {
          patternStr = String(value.$regex);
        }

        let startsWithAnchor = false;
        let endsWithAnchor = false;

        if (patternStr.startsWith("^")) {
          startsWithAnchor = true;
          patternStr = patternStr.slice(1);
        }
        if (patternStr.endsWith("$")) {
          endsWithAnchor = true;
          patternStr = patternStr.slice(0, -1);
        }

        let likeVal = patternStr;
        if (!startsWithAnchor) likeVal = "%" + likeVal;
        if (!endsWithAnchor) likeVal = likeVal + "%";

        result[key] = { [Op.like]: likeVal };
        continue;
      }

      newValue = translateMongoQuery(value);
    } else if (value instanceof RegExp) {
      let patternStr = value.source;
      let startsWithAnchor = false;
      let endsWithAnchor = false;

      if (patternStr.startsWith("^")) {
        startsWithAnchor = true;
        patternStr = patternStr.slice(1);
      }
      if (patternStr.endsWith("$")) {
        endsWithAnchor = true;
        patternStr = patternStr.slice(0, -1);
      }

      let likeVal = patternStr;
      if (!startsWithAnchor) likeVal = "%" + likeVal;
      if (!endsWithAnchor) likeVal = likeVal + "%";

      result[key] = { [Op.like]: likeVal };
      continue;
    }

    result[newKey] = newValue;
  }
  return result;
}

class MongooseQueryBuilder {
  constructor(model, type, queryOptions = {}, data = {}, updateOptions = {}) {
    this.model = model;
    this.type = type;
    this.queryOptions = queryOptions;
    this.data = data;
    this.updateOptions = updateOptions;
    this.include = [];
    this.attributes = undefined;
    this.order = undefined;
    this.limitVal = undefined;
    this.offsetVal = undefined;
  }

  populate(assocName, fields) {
    let finalAssocName = assocName;
    if (assocName === "cropId") finalAssocName = "cropIdDetails";
    if (assocName === "activeCrop") finalAssocName = "activeCropDetails";

    let includeOption = { association: finalAssocName };
    if (fields) {
      const attrs = fields.split(" ").filter(f => f);
      const exclude = attrs.filter(f => f.startsWith("-")).map(f => f.slice(1));
      const includeAttrs = attrs.filter(f => !f.startsWith("-"));
      
      if (exclude.length > 0) {
        includeOption.attributes = { exclude };
      } else if (includeAttrs.length > 0) {
        includeOption.attributes = includeAttrs;
      }
    }
    this.include.push(includeOption);
    return this;
  }

  select(fields) {
    if (typeof fields === "string") {
      const parts = fields.split(" ").filter(p => p);
      const exclude = parts.filter(p => p.startsWith("-")).map(p => p.slice(1));
      const include = parts.filter(p => !p.startsWith("-"));

      this.attributes = this.attributes || {};
      if (exclude.length > 0) {
        this.attributes.exclude = (this.attributes.exclude || []).concat(exclude);
      }
      if (include.length > 0) {
        this.attributes.attributes = include;
      }
    }
    return this;
  }

  sort(sortObj) {
    if (sortObj) {
      if (typeof sortObj === "object") {
        this.order = Object.entries(sortObj).map(([key, val]) => [key, val === -1 || val === "desc" || val === "DESC" ? "DESC" : "ASC"]);
      } else if (typeof sortObj === "string") {
        const parts = sortObj.split(" ").filter(p => p);
        this.order = parts.map(part => {
          const desc = part.startsWith("-");
          const field = desc ? part.slice(1) : part;
          return [field, desc ? "DESC" : "ASC"];
        });
      }
    }
    return this;
  }

  limit(l) {
    this.limitVal = parseInt(l, 10);
    return this;
  }

  skip(s) {
    this.offsetVal = parseInt(s, 10);
    return this;
  }

  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this.execute().catch(onRejected);
  }

  async execute() {
    const options = { ...this.queryOptions };
    if (this.include.length > 0) options.include = this.include;
    if (this.attributes) {
      if (this.attributes.exclude) options.attributes = { exclude: this.attributes.exclude };
      if (this.attributes.attributes) options.attributes = this.attributes.attributes;
    }
    if (this.order) options.order = this.order;
    if (this.limitVal !== undefined) options.limit = this.limitVal;
    if (this.offsetVal !== undefined) options.offset = this.offsetVal;

    if (this.type === "findOne") {
      return this.model.sequelizeFindOne(options);
    } else if (this.type === "findById") {
      const id = options.where && options.where._id;
      return this.model.findByPk(id, options);
    } else if (this.type === "findByIdAndUpdate") {
      const id = options.where && options.where._id;
      let instance = await this.model.findByPk(id);
      if (!instance) return null;
      const cleanData = { ...this.data };
      delete cleanData.$setOnInsert;
      await instance.update(cleanData);
      return this.model.findByPk(id, options);
    } else if (this.type === "findOneAndUpdate") {
      let instance = await this.model.sequelizeFindOne({ where: options.where });
      if (instance) {
        const cleanUpdate = { ...this.data };
        delete cleanUpdate.$setOnInsert;
        await instance.update(cleanUpdate);
        return this.model.sequelizeFindOne(options);
      } else {
        if (this.updateOptions.upsert) {
          const setOnInsert = this.data.$setOnInsert || {};
          const cleanUpdate = { ...this.data };
          delete cleanUpdate.$setOnInsert;
          const createData = { ...options.where, ...cleanUpdate, ...setOnInsert };
          for (const key in createData) {
            if (key.startsWith("$")) delete createData[key];
          }
          const created = await this.model.create(createData);
          return this.model.findByPk(created._id, options);
        }
        return null;
      }
    } else {
      return this.model.sequelizeFindAll(options);
    }
  }
}

class MongooseCompatModel extends Model {
  toJSON() {
    const data = super.toJSON();
    if (data.activeCropDetails !== undefined) {
      data.activeCrop = data.activeCropDetails;
      delete data.activeCropDetails;
    }
    if (data.cropIdDetails !== undefined) {
      data.cropId = data.cropIdDetails;
      delete data.cropIdDetails;
    }
    return data;
  }

  static sequelizeFindOne(options) {
    return super.findOne(options);
  }

  static sequelizeFindAll(options) {
    return super.findAll(options);
  }

  static findById(id) {
    return new MongooseQueryBuilder(this, "findById", { where: { _id: id } });
  }

  static findOne(query = {}) {
    const where = translateMongoQuery(query.where || query);
    return new MongooseQueryBuilder(this, "findOne", { where });
  }

  static find(query = {}) {
    const where = translateMongoQuery(query.where || query);
    return new MongooseQueryBuilder(this, "find", { where });
  }

  static findByIdAndUpdate(id, data, options = {}) {
    return new MongooseQueryBuilder(this, "findByIdAndUpdate", { where: { _id: id } }, data, options);
  }

  static findOneAndUpdate(query = {}, update = {}, options = {}) {
    const where = translateMongoQuery(query.where || query);
    return new MongooseQueryBuilder(this, "findOneAndUpdate", { where }, update, options);
  }

  static async findByIdAndDelete(id) {
    const instance = await this.findByPk(id);
    if (!instance) return null;
    await instance.destroy();
    return instance;
  }

  static async findOneAndDelete(query = {}) {
    const where = translateMongoQuery(query.where || query);
    const instance = await this.sequelizeFindOne({ where });
    if (!instance) return null;
    await instance.destroy();
    return instance;
  }

  static deleteMany(query = {}) {
    const where = translateMongoQuery(query.where || query);
    return this.destroy({ where });
  }

  static updateMany(query = {}, data = {}) {
    const where = translateMongoQuery(query.where || query);
    const cleanData = { ...data };
    for (const key in cleanData) {
      if (key.startsWith("$")) delete cleanData[key];
    }
    return this.update(cleanData, { where });
  }

  static deleteOne(query = {}) {
    const where = translateMongoQuery(query.where || query);
    return this.destroy({ where, limit: 1 });
  }

  static distinct(field, query = {}) {
    const where = translateMongoQuery(query.where || query);
    return this.findAll({
      attributes: [[this.sequelize.fn("DISTINCT", this.sequelize.col(field)), field]],
      where,
      raw: true
    }).then(rows => rows.map(r => r[field]));
  }

  static insertMany(records, options = {}) {
    return this.bulkCreate(records, options);
  }
}

module.exports = { MongooseCompatModel, translateMongoQuery };
