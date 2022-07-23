"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const badRequest = (ctx, error) => {
  ctx.response.status = 400;
  ctx.response.body = { status: 400, error };
};

module.exports = {
  async toggleLike(ctx) {
    const { user, post } = ctx.query;
    if (!user || !post) {
      return badRequest(ctx, {
        id: "post-like.invalid-params",
        message: "",
      });
    }
    const count = await strapi.services["post-like"].count({
      user,
      post,
    });
    if (count === 0) {
      await strapi.services["post-like"].create({ user: user, post: post });
    } else {
      await strapi.services["post-like"].delete({ user: user, post: post });
    }

    const likes = await strapi.services["post-like"].find({ post }, []);
    return likes;
  },
};
