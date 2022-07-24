module.exports = ({ env }) => ({
  proxy: true,
  url: env("SERVER_URL"),
  // app: {
  //   keys: env.array('APP_KEYS')
  // },
});
