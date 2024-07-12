module.exports = {
  apps: [
    {
      name: "vouchapi",
      script: "server.js",
      watch: true,
      ignore_watch: ["node_modules"],
      watch_options: {
        followSymlinks: false,
      },
    },
  ],
};
