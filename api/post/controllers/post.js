"use strict";

const { sanitizeEntity, parseMultipartData } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    const filter = ctx.query;
    console.log(filter);
    const entities = await strapi.services["post"].find({
      _start: "0",
      _limit: "30",
    });
    return entities;
  },

  async create(ctx) {
    const { data, files } = parseMultipartData(ctx);
    let entity = await strapi.services["post"].create(data, { files });
    return entity;
  },

  async delete(ctx) {
    const { id } = ctx.params;
    await strapi.services["post"].delete({ id });
    return {
      statusText: "done",
    };
  },
};
