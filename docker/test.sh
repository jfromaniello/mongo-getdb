# prepare
./docker/prepare.sh
# run tests
docker-compose run --rm test npm run docker:test
# cleanup
./docker/cleanup.sh