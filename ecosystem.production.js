module.exports = {
  apps: [
    {
      name: 'suno-lyric-production',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1G',
      log_file: '/home/user/webapp/logs/production.log',
      error_file: '/home/user/webapp/logs/production-error.log',
      out_file: '/home/user/webapp/logs/production-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
}
