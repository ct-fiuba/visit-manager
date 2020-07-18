HEROKU_APP_NAME := tutubo-media-server
TEST_CONTAINER_NAME=my-test-mongo

.PHONY: install
install:
	npm install;

.PHONY: run
run: install
	npm start;

.PHONY: test
test:
	docker run --rm -d -p 27017:27017 --name="$(TEST_CONTAINER_NAME)" mongo:3.6.4;
	(npm test && npm run test:integration && docker stop $(TEST_CONTAINER_NAME)) || docker stop $(TEST_CONTAINER_NAME); 

# -- Heroku related commands
# You need to be logged in Heroku CLI before doing this
#   heroku login
#   heroku container:login
.PHONY: heroku-push
heroku-push:
	heroku container:push web --recursive --app=$(HEROKU_APP_NAME) --verbose

.PHONY: heroku-release
heroku-release:
	heroku container:release web --app $(HEROKU_APP_NAME) --verbose


.PHONY: ping
ping:
	curl -vvv "localhost:5005/ping"

.PHONY: help
help:
	@echo 'Usage: make <target>'
	@echo ''
	@echo 'Available targets are:'
	@echo ''
	@grep -E '^\.PHONY: *' $(MAKEFILE_LIST) | cut -d' ' -f2- | sort