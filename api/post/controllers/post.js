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

const filteredCombinedGithubPost = (post, repo) => {
  return {
    id: post?.id,
    title: post?.title,
    description: post?.description,
    hashtag: post?.hashtag,
    author: repo?.owner?.login,
    stars: repo?.stargazers_count,
    used_language: repo?.language,
    url: repo?.html_url,
    readme_url: `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/README.md`,
    full_name: repo?.full_name,
  };
};

const filteredPost = (post) => {
  return {
    id: post.id,
    title: post.title,
    description: post.description,
    hashtag: post.hashtag,
  };
};

const filteredRepo = (repo) => {
  return {
    id: repo.node_id,
    name: repo.name,
    full_name: repo.full_name,
    url: repo.html_url,
    user: repo.owner?.login,
    description: repo.description,
    updated_at: repo.updated_at,
  };
};

const filteredRepos = (repos) => {
  return repos?.map((r) => filteredRepo(r));
};

const repoPostCombiner = (posts, repos) => {
  return posts.map((post) => {
    const findedRepo = repos.find(
      (repo) => repo.node_id === post.github_repository_id
    );
    if (!findedRepo) {
      return filteredPost(post);
    }
    return filteredCombinedGithubPost(post, findedRepo);
  });
};

module.exports = {
  async find(ctx) {
    const { token } = ctx.query;
    const filter = ctx.query;
    const posts = await strapi.services["post"].find();
    const repos = await axios.get("https://api.github.com/user/repos", {
      headers: {
        authorization: `token ${token}`, // 토큰 명시 필수!!!
      },
    });
    console.log(repos);
    // console.log("컴바이너", repoPostCombiner(posts, repos.data));
    return repoPostCombiner(posts, repos.data);
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
    return filteredCombinedGithubPost(result, matchedRepo);
  },

  async create(ctx) {
    const data = ctx.query;
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
    return filteredRepos(data);
  },
};
