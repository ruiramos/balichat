require 'bundler/capistrano'

set :application, "chat.twintend.com" # Application name.
set :domain, "chat.twintend.com" # Web server url.
set :user, "twintend-deploy" # Remote user name. Must be able to log in via SSH.
set :use_sudo, false # Remove or set the true if all commands should be run through sudo.

#set :local_user, "tpinto" # Local user name.

set :deploy_to, "/var/www/apps/chat.twintend.com"
set :deploy_via, :export

set :scm, 'git'
set :repository,  "file:///home/git/balichat.git"
set :local_repository, "git@git.twintend.com:balichat.git"
#set :git_enable_submodules, 1 # if you have vendored rails
set :branch, 'master'
set :git_shallow_clone, 1
set :scm_verbose, true

set :keep_releases, 1

role :app, domain
role :web, domain
role :db,  domain, :primary => true

# extra
#set :bundle_flags,               "--deployment"
set :normalize_asset_timestamps, false
set :rails_env,                  "production"

#set :runner,                     "www-data"
#set :admin_runner,               "www-data"

ssh_options[:keys] = ["~/.ssh/id_rsa"]

# Add Configuration Files & Compile Assets
after 'deploy:update_code' do
  # Setup Configuration
  run "cp #{shared_path}/config/database.yml #{release_path}/config/database.yml"
  run "cp #{shared_path}/config/ejabberd.yml #{release_path}/config/ejabberd.yml"
  run "cp #{shared_path}/config/s3.yml #{release_path}/config/s3.yml"

  # Compile Assets
  run "cd #{release_path}; RAILS_ENV=production bundle exec rake assets:precompile"
end

# Restart Passenger
deploy.task :restart, :roles => :app do
  ## Fix Permissions
  #run "chown -R www-data:www-data #{current_path}"
  #run "chown -R www-data:www-data #{latest_release}"
  #run "chown -R www-data:www-data #{shared_path}/bundle"
  #run "chown -R www-data:www-data #{shared_path}/log"

  # Restart Application
  run "touch #{current_path}/tmp/restart.txt"
end