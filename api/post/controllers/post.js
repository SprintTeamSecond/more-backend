"use strict";

const { sanitizeEntity, parseMultipartData } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    const filter = ctx.query;
    const entities = await strapi.query("post").find(filter);
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
