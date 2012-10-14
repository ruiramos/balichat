JABBER = File.open(Rails.root.join("config","ejabberd.yml")) { |file| YAML.load(file) }[Rails.env].symbolize_keys

UPLOADS = File.open(Rails.root.join("config","s3.yml")) { |file| YAML.load(file) }[Rails.env].symbolize_keys