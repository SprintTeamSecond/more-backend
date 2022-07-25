"use strict";

const { default: axios } = require("axios");
const octokit = require("octokit");

const badRequest = (ctx, error) => {
  ctx.response.status = 400;
  ctx.response.body = { status: 400, error };
};

const filteredUser = (user, github) => {
  // console.log(user);
  return {
    id: user.id,
    avatar: github?.avatar_url,
    url: github?.html_url,
    name: github?.name ? github.name : github?.login,
    introduce: github?.bio || "",
  };
};

module.exports = {
  async getAccessToken(ctx) {
    const { code } = ctx.query;
    const { data } = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_SECRET_KEY,
        code,
        redirect_uri: "https://mo-re.netlify.app/callback",
      },
      {
        headers: {
          accept: "application/json",
        },
      }
    );
    if (!data?.access_token) {
      return badRequest(ctx, {
        id: "post-like.invalid-params",
        message: "",
      });
    }
    return data.access_token;
  },

  async loginWithGithub(ctx) {
    const { token } = ctx.query;
    if (!token) {
      return badRequest(ctx, {
        id: "no_access_token",
        message: "",
      });
    }
    const { data } = await axios.get("https://api.github.com/user", {
      headers: {
        authorization: `token ${token}`, // 토큰 명시 필수!!!
      },
    });
    // console.log(data);

    if (!data) {
      return badRequest(ctx, {
        id: "no_match_user",
        message: "",
      });
    }
    const uid = data.node_id;

    const user = await strapi.query("user", "users-permissions").findOne({
      github_uid: uid,
    });
    if (user) {
      // console.log(filteredUser(user, data));
      return filteredUser(user, data);
    }
    // console.log(user);

    await strapi.query("user", "users-permissions").create({
      username: data?.name ? data.name : data?.login,
      github_uid: uid,
      email: data.html_url || "example@example.com",
      role: "authenticated",
    });

    const newUser = await strapi.query("user", "users-permissions").findOne({
      github_uid: uid,
    });

    return filteredUser(newUser, data);
  },
};
