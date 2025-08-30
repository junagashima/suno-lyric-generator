module.exports = {
  apps: [{
    name: 'suno-lyric-generator-enhanced',
    script: 'npm',
    args: 'start',
    cwd: '/home/user/webapp',
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}