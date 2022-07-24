const parse = require("pg-connection-string").parse;
const config = parse(process.env.DATABASE_URL);

//로컬로 이용하고 싶을때 주석 바꾸기
// module.exports = ({ env }) => ({
//   defaultConnection: "default",
//   connections: {
//     default: {
//       connector: "bookshelf",
//       settings: {
//         client: "sqlite",
//         filename: env("DATABASE_FILENAME", ".tmp/data.db"),
//       },
//       options: {
//         useNullAsDefault: true,
//       },
//     },
//   },
// });

module.exports = ({ env }) => ({
  defaultConnection: "default",
  connections: {
    default: {
      connector: "mongoose",
      settings: {
        uri: env("DATABASE_URL"),
      },
      options: {
        ssl: true,
      },
    },
  },
});
