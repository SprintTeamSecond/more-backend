"use strict";
const { default: axios } = require("axios");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const badRequest = (ctx, error) => {
  ctx.response.status = 400;
  ctx.response.body = { status: 400, error };
};

const filteredPost = (post, repo) => {
  return {
    id: post.id,
    title: post.title,
    description: post.description,
    hashtag: post.hashtag,
    author: repo.owner.login,
    stars: repo.stargazers_count,
    used_language: repo.language,
    url: repo.html_url,
  };
};

const filteredRepos = (repos) => {
  return repos?.map((r) => {
    return {
      id: r.node_id,
      name: r.name,
      url: r.html_url,
      user: r.owner.login,
      description: r.description,
    };
  });
};

module.exports = {
  async find(ctx) {
    const filter = ctx.query;
    const entities = await strapi.services["post"].find(filter);
    console.log(entities);
    return entities;
  },

  async findOne(ctx) {
    const { token } = ctx.query;
    const { id } = ctx.params;
    const result = await strapi.services["post"].findOne({ id: id });
    if (!result) {
      return badRequest(ctx, {
        id: "not_found_matched_post",
        message: "",
      });
    }
    const repos = await axios.get("https://api.github.com/user/repos", {
      headers: {
        authorization: `token ${token}`, // 토큰 명시 필수!!!
      },
    });
    const matchedRepo = repos?.data.find(
      (r) => r.node_id === result.github_repository_id
    );
    if (!matchedRepo) {
      return badRequest(ctx, {
        id: "not_found_repository",
        message: "",
      });
    }
    console.log(filteredPost(result, matchedRepo));
    return filteredPost(result, matchedRepo);
  },

  async create(ctx) {
    const data = ctx.query;
    console.log(data);
    if (!data?.github_repository_id) {
      return badRequest(ctx, {
        id: "not_have_required_data",
        message: "필수 정보가 입력되지 않았습니다.",
      });
    }
    const duplicatedPost = await strapi.services["post"].findOne({
      github_repository_id: data.github_repository_id,
    });
    if (duplicatedPost) {
      return badRequest(ctx, {
        id: "repository_duplicate",
        message: "중복된 레포지토리가 존재합니다.",
      });
    }
    let entity = await strapi.services["post"].create({
      ...data,
    });
    return entity;
  },

  async delete(ctx) {
    const { id } = ctx.params;
    await strapi.services["post"].delete({ id });
    return {
      statusText: "done",
    };
  },

  async getRepositories(ctx) {
    const { token } = ctx.query;
    const { data } = await axios.get("https://api.github.com/user/repos", {
      headers: {
        authorization: `token ${token}`, // 토큰 명시 필수!!!
      },
    });
    console.log(data);
    return filteredRepos(data);
  },
};
